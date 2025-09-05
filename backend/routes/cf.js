// backend/routes/cf.js
import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

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
  for (const d of DOMAINS) for (const p of paths) urls.push(`${d}${p}?locale=en`);
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

// quick health check
router.get('/ping', (_, res) => res.json({ ok: true }));

// GET /api/cf/problem/:contestId/:index
router.get('/problem/:contestId/:index', async (req, res) => {
  const { contestId, index } = req.params;
  const candidates = buildCandidates(contestId, index);

  // Headers that work well with CF and node-fetch
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate', // avoid brotli issues
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  try {
    let html = null;
    let finalUrl = null;
    let finalBase = null;
    let lastStatus = null;

    for (const u of candidates) {
      const base =
        u.startsWith('https://mirror.') ? 'https://mirror.codeforces.com'
        : u.startsWith('https://m1.') ? 'https://m1.codeforces.com'
        : 'https://codeforces.com';

      try {
        const r = await fetch(u, { headers });
        lastStatus = r.status;
        if (!r.ok) continue;

        const text = await r.text();
        const lc = text.toLowerCase();
        // Skip Cloudflare/challenge pages
        if (
          lc.includes('attention required') ||
          lc.includes('just a moment') ||
          (lc.includes('cloudflare') && !lc.includes('problem-statement'))
        ) {
          continue;
        }

        html = text;
        finalUrl = u.replace(/\?locale=en$/, '');
        finalBase = base;
        break;
      } catch {
        // try next candidate
      }
    }

    if (!html) {
      return res
        .status(502)
        .json({ error: `Failed to load Codeforces problem page (last status ${lastStatus || 'n/a'})` });
    }

    const $ = cheerio.load(html);
    let $stmt = $('.problem-statement').first();

    if ($stmt.length === 0) {
      // Try a couple of alternate containers CF sometimes uses
      const alt = [
        '#pageContent .problem-statement',
        '.problemindexholder .problem-statement',
        '.ttypography .problem-statement',
      ];
      for (const sel of alt) {
        const t = $(sel).first();
        if (t.length) { $stmt = t; break; }
      }
    }

    if ($stmt.length === 0) {
      return res.status(503).json({
        error: 'Codeforces page loaded, but no problem statement found (likely a bot/challenge page).',
        url: finalUrl,
      });
    }

    // absolutize links & images
    $stmt.find('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) $(el).attr('href', absolutize(href, finalBase));
    });
    $stmt.find('img').each((_, el) => {
      const $el = $(el);
      const src = $el.attr('src') || $el.attr('data-src');
      if (src) $el.attr('src', absolutize(src, finalBase));
      const srcset = $el.attr('srcset');
      if (srcset) {
        const fixed = srcset
          .split(',')
          .map(item => {
            const [u2, d] = item.trim().split(/\s+/);
            return `${absolutize(u2, finalBase)}${d ? ' ' + d : ''}`;
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
        '*': ['class'] // keep it simple to avoid typings complaints
      },
      transformTags: {
        a: (tagName, attribs) => ({
          tagName: 'a',
          attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
        }),
      },
    });

    res.json({
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
    });
  } catch (e) {
    console.error('CF scrape error:', e);
    res.status(500).json({ error: 'Failed to fetch CF problem.' });
  }
});

export default router;
