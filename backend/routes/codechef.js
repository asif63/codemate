import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// GET /api/codechef
router.get('/', async (_req, res) => {
  try {
    const r = await fetch('https://www.codechef.com/api/list/contests/all', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ message: txt || 'CodeChef responded with an error' });
    }

    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error('CodeChef proxy error:', e);
    res.status(500).json({ message: 'Failed to fetch CodeChef contests' });
  }
});

export default router;
