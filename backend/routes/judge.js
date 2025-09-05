// backend/routes/judge.js
import express from 'express';

const router = express.Router();

const LANG_ID = {
  cpp: 54,         // C++ (GCC 9.2)
  c: 50,
  python: 71,      // Python 3.8
  javascript: 63,  // Node.js
  java: 62,        // Java 11
};

// Use local Judge0 unless overridden in .env
const BASE = (process.env.JUDGE0_URL || 'http://localhost:2358').replace(/\/$/, '');

function judgeHeaders() {
  const h = { 'Content-Type': 'application/json' };
  // If your provider requires an auth/header, set JUDGE0_KEY and adjust as needed:
  if (process.env.JUDGE0_KEY) {
    h['X-Auth-Token'] = process.env.JUDGE0_KEY;
  }
  return h;
}

// POST /api/judge/run  { language, code, stdin }
router.post('/run', async (req, res) => {
  try {
    const { language, code, stdin } = req.body || {};
    if (!language || !code) {
      return res.status(400).json({ message: 'language and code required' });
    }

    const language_id = LANG_ID[language];
    if (!language_id) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const body = {
      language_id,
      source_code: code,
      stdin: stdin || '',
      redirect_stderr_to_stdout: true,
    };

    const url = `${BASE}/submissions?base64_encoded=false&wait=true`;
    // Node 18+ has global fetch — no node-fetch import needed
    const r = await fetch(url, {
      method: 'POST',
      headers: judgeHeaders(),
      body: JSON.stringify(body),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(502).json({
        message: `Judge0 error ${r.status}`,
        detail: typeof data === 'object' ? JSON.stringify(data) : String(data),
      });
    }

    res.json({
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
