// backend/routes/judge0.js  (ESM)
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const BASE = process.env.JUDGE0_URL || 'http://localhost:2358';

const LANG_ID = {
  c: 50,          // GCC
  cpp: 54,        // G++ 17
  cpp17: 54,
  java: 62,       // OpenJDK
  javascript: 63, // Node.js
  js: 63,
  python: 71,     // Python 3
  py: 71
};

function judgeHeaders() {
  const h = { 'Content-Type': 'application/json' };
  // RapidAPI headers (only if you have a key)
  if (process.env.JUDGE0_KEY) {
    h['X-RapidAPI-Key'] = process.env.JUDGE0_KEY;
    h['X-RapidAPI-Host'] = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
  }
  return h;
}

// quick health check
router.get('/health', async (req, res) => {
  try {
    const r = await fetch(`${BASE}/languages`, { headers: judgeHeaders() });
    if (!r.ok) return res.status(502).json({ ok: false, code: r.status });
    const langs = await r.json();
    res.json({ ok: true, count: langs?.length || 0 });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e?.message || e) });
  }
});

// run code (wait=true: single call)
router.post('/run', async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};
    if (!language || !code) {
      return res.status(400).json({ message: 'language and code required' });
    }
    const language_id = LANG_ID[language.toLowerCase()];
    if (!language_id) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const url = `${BASE}/submissions?base64_encoded=false&wait=true`;
    const body = {
      language_id,
      source_code: code,
      stdin: stdin || '',
      redirect_stderr_to_stdout: true,
    };

    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: judgeHeaders(),
        body: JSON.stringify(body)
      });
    } catch (err) {
      return res
        .status(502)
        .json({ message: `Cannot reach Judge0 at ${BASE}`, detail: String(err?.message || err) });
    }

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res
        .status(502)
        .json({ message: `Judge0 error ${r.status}`, detail: data });
    }

    return res.json({
      status: data?.status?.description || 'Unknown',
      statusId: data?.status?.id,
      stdout: data?.stdout || '',
      stderr: data?.stderr || '',
      compile_output: data?.compile_output || '',
      time: data?.time,
      memory: data?.memory,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Server error' });
  }
});

export default router;
