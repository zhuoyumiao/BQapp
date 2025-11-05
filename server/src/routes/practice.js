import { Router } from 'express';
import { getDB } from '../db/connect.js';

const router = Router();

// GET /api/v1/practice/random?tags=foo,bar&q=optional text
router.get('/random', async (req, res, next) => {
  try {
    const db = getDB();
    const { tags, q } = req.query || {};
    const match = {};

    if (q) {
      match.$text = { $search: q };
    }

    if (tags) {
      match.tags = {
        $in: String(tags)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    const pipeline = [];
    if (Object.keys(match).length) pipeline.push({ $match: match });
    pipeline.push({ $sample: { size: 1 } });

    const items = await db.collection('questions').aggregate(pipeline).toArray();
    if (!items || items.length === 0) return res.status(404).json({ error: 'No question found' });

    const question = items[0];

    // Load related answers from the answers collection for comparison views
    const answers = await db
      .collection('answers')
      .find({ questionId: question._id })
      .project({ _id: 1, type: 1, content: 1, createdAt: 1 })
      .toArray();

    // Group answers by type
    const answersByType = {};
    for (const a of answers) {
      const t = a.type || 'other';
      if (!answersByType[t]) answersByType[t] = [];
      answersByType[t].push(a);
    }

    res.json({ question, answers, answersByType });
  } catch (err) {
    next(err);
  }
});

export default router;
