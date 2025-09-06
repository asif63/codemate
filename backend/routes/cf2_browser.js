// backend/routes/cf2_browser.js
import express from 'express';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

// very small in-memory cache (10 minutes)
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map(); // key: `${contestId}-${index}` -> { t, data }

const DOMAINS = [
  'https://codeforces.com',
  'https://mirror.codeforces.com',
  'https://m1.codeforces.com',
];

function buildCandidates(contestId, index) {
  const paths = [
    `/problemset/problem/${contestId}/${index}`,
    `/contest/${contestId}/problem/${index}`,
  ];
  const urls = [];
  for (const d of DOMAINS) {
    for (const p of paths) {
      urls.push(`${d}${p}?locale=en`);
      urls.push(`${d}${p}?locale=en&mobile=true`);
    }
  }
  return urls;
}

function absolutize(url, base) {
  if (!url) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return base + url;
  return url;
}
function preToPlain($pre) {
  let html = $pre.html() || '';
  html = html.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/\r/g, '');
  const $ = cheerio.load('<div>' + html + '</div>');
  return $('div').text();
}

router.get('/ping', (_, res) => res.json({ ok: true }));

// GET /api/cf2/problem/:contestId/:index
router.get('/problem/:contestId/:index', async (req, res) => {
  const { contestId, index } = req.params;
  const cacheKey = `${contestId}-${index}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && (now - hit.t) < CACHE_MS) {
    return res.json(hit.data);
  }

  const candidates = buildCandidates(contestId, index);

  let html = null;
  let finalUrl = null;
  let finalOrigin = null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true,args:[
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--no-zygote',
      '--single-process']
     }); // change to false to debug visually
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    for (const u of candidates) {
      try {
        await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // If a Turnstile/CF challenge appears, this selector won't appear.
        await page.waitForSelector('.problem-statement', { timeout: 7000 });
        html = await page.content();
        finalUrl = u.replace(/\?locale=en(&mobile=true)?$/, '');
        finalOrigin = new URL(finalUrl).origin;
        break;
      } catch {
        // try the next candidate
      }
    }

    await browser.close();
  } catch (e) {
    try { await browser?.close(); } catch {}
    return res.status(502).json({ error: 'Headless browser failed to start or navigate.' });
  }

  if (!html) {
    return res.status(503).json({
      error: 'Could not load the problem in a headless browser (challenge likely). Try opening on Codeforces directly.',
      url: candidates[0],
    });
  }

  const $ = cheerio.load(html);
  let $stmt = $('.problem-statement').first();
  if ($stmt.length === 0) {
    return res.status(503).json({
      error: 'Problem page loaded but no .problem-statement found (challenge layout?).',
      url: finalUrl,
    });
  }

  // absolutize links & images inside the statement
  $stmt.find('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) $(el).attr('href', absolutize(href, finalOrigin));
  });
  $stmt.find('img').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src') || $el.attr('data-src');
    if (src) $el.attr('src', absolutize(src, finalOrigin));
    const srcset = $el.attr('srcset');
    if (srcset) {
      const fixed = srcset
        .split(',')
        .map(item => {
          const [u2, d] = item.trim().split(/\s+/);
          return `${absolutize(u2, finalOrigin)}${d ? ' ' + d : ''}`;
        })
        .join(', ');
      $el.attr('srcset', fixed);
    }
  });

  // meta
  const rawTitle = $stmt.find('.title').first().text().trim();
  const title = rawTitle.replace(/^[A-Z]\.\s*/, '');

  const timeLimit = $stmt.find('.time-limit').text().replace(/time limit per test/gi, '').trim();
  const memoryLimit = $stmt.find('.memory-limit').text().replace(/memory limit per test/gi, '').trim();
  const inputFile = ($stmt.find('.input-file').text().trim() || '');
  const outputFile = ($stmt.find('.output-file').text().trim() || '');

  // samples
  const inputs = $stmt.find('.sample-tests .input pre, .sample-test .input pre');
  const outputs = $stmt.find('.sample-tests .output pre, .sample-test .output pre');
  const samples = [];
  const n = Math.max(inputs.length, outputs.length);
  for (let i = 0; i < n; i++) {
    const pin = inputs.get(i);
    const pout = outputs.get(i);
    const input = pin ? preToPlain($(pin)) : '';
    const output = pout ? preToPlain($(pout)) : '';
    if (input || output) samples.push({ input, output });
  }

  const statementHtml = sanitizeHtml($stmt.html() || '', {
    allowedTags: [
      'h1','h2','h3','h4','h5','h6',
      'p','span','div','ul','ol','li','em','strong','i','b','u','s',
      'table','thead','tbody','tr','th','td','caption',
      'pre','code','br','sub','sup','img','a','hr'
    ],
    allowedAttributes: {
      a: ['href','name','target','rel'],
      img: ['src','alt','srcset'],
      '*': ['class']
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
      }),
    },
  });

  const payload = {
    contestId,
    index,
    url: finalUrl,
    title,
    timeLimit,
    memoryLimit,
    inputFile,
    outputFile,
    samples,
    statementHtml,
  };

  cache.set(cacheKey, { t: Date.now(), data: payload });
  res.json(payload);
});

export default router;
