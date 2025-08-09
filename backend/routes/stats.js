// routes/stats.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Codeforces user‐tag stats + unique count + rating
 * GET /api/stats/codeforces/:handle
 */
router.get('/codeforces/:handle', async (req, res) => {
  const { handle } = req.params;
  try {
    // 1) submissions → tags + unique count
    const { data: statusData } = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    const seen = new Set();
    const tagCounts = {};
    statusData.result.forEach(s => {
      if (s.verdict === 'OK') {
        const pid = `${s.problem.contestId}-${s.problem.index}`;
        if (!seen.has(pid)) {
          seen.add(pid);
          s.problem.tags.forEach(t => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
        }
      }
    });

    // 2) user.info → rating
    const { data: infoData } = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const userInfo = infoData.result[0] || {};
    const rating = userInfo.rating ?? 0;

    res.json({
      tags: tagCounts,
      totalSolved: seen.size,
      rating
    });
  } catch (err) {
    console.error('CF stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Codeforces stats' });
  }
});

/**
 * LeetCode user‐difficulty stats + exact total solved
 * GET /api/stats/leetcode/:username
 */
router.get('/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const graphqlQuery = {
      query: `
        {
          matchedUser(username: "${username}") {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `
    };
    const { data: resp } = await axios.post(
      'https://leetcode.com/graphql',
      graphqlQuery,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const stats = resp.data.matchedUser.submitStats.acSubmissionNum;
    const tagCounts = {};
    let totalSolved = 0;
    let rating = null;

    stats.forEach(item => {
      if (item.difficulty === 'All') {
        totalSolved = item.count;
        // LeetCode GraphQL does not expose rating; skip
      } else {
        tagCounts[item.difficulty] = item.count;
      }
    });

    res.json({ tags: tagCounts, totalSolved, rating });
  } catch (err) {
    console.error('LC stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch LeetCode stats' });
  }
});

export default router;
