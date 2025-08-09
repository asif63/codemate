// routes/leetcodeProxy.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// POST /api/leetcode/problems
router.post('/problems', async (req, res) => {
  try {
    const { query, variables } = req.body || {};
    const { data } = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          // These headers help avoid being blocked
          'Referer': 'https://leetcode.com',
          'Origin': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0',
        },
        // timeout: 10000, // optional
      }
    );
    res.json(data);
  } catch (err) {
    console.error('LC proxy error:', err.response?.status, err.response?.data || err.message);
    res.status(500).json({
      error: 'LeetCode proxy failed',
      details: err.response?.data || err.message,
    });
  }
});

export default router;
