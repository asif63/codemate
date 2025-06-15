import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/codeforces/:handle', async (req, res) => {
  const { handle } = req.params;

  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    const submissions = response.data.result;

    const solvedProblems = new Set();
    const tagCounts = {};

    submissions.forEach(submission => {
      if (submission.verdict === 'OK') {
        const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        if (!solvedProblems.has(problemId)) {
          solvedProblems.add(problemId);
          submission.problem.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    res.json({ tags: tagCounts });
  } catch (error) {
    console.error('Error fetching Codeforces data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Codeforces API.' });
  }
});



export default router;
