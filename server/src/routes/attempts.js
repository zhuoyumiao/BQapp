// src/routes/attempts.js
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../db/connect.js';

const router = Router();

// get userid
function getUserId(req) {
  if (!req.user?._id) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return req.user._id;
}

//GET /api/v1/attempts?page=&limit=
// get user's attempts
router.get('/', async (req, res, next) => {
  try {
    const db = await connectDB();
    const attempts = db.collection('attempts');
    const questions = db.collection('questions');

    const userId = getUserId(req);
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));

    const match = { userId };

    const total = await attempts.countDocuments(match);
    const items = await attempts
      .find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    if (items.length) {
      const qids = [...new Set(items.map((i) => i.questionId).filter(Boolean))];
      if (qids.length) {
        const qs = await questions
          .find({ _id: { $in: qids } }, { projection: { title: 1 } })
          .toArray();

        const map = new Map(qs.map((d) => [String(d._id), d.title || '']));
        items.forEach((i) => {
          if (i.questionId) i.questionTitle = map.get(String(i.questionId)) || '';
        });
      }
    }

    res.json({ items, total, page });
  } catch (e) {
    next(e);
  }
});

//GET /api/v1/attempts/:id
// get the detail of one attempt
router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectDB();
    const attempts = db.collection('attempts');
    const questions = db.collection('questions');

    const userId = getUserId(req);
    const _id = new ObjectId(req.params.id);

    const attempt = await attempts.findOne({ _id, userId });
    if (!attempt) return res.status(404).json({ error: 'Not found' });

    let question = null;
    if (attempt.questionId) {
      question = await questions.findOne(
        { _id: attempt.questionId },
        { projection: { title: 1, body: 1, tags: 1 } }
      );
    }

    res.json({ ...attempt, question });
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/attempts
// create a new attempt (authenticated users only)
router.post('/', async (req, res, next) => {
  try {
    const db = await connectDB();
    const attempts = db.collection('attempts');

    const userId = getUserId(req);
    const { questionId, content, type = 'user' } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });

    let qid = null;
    if (questionId) {
      if (ObjectId.isValid(questionId)) qid = new ObjectId(questionId);
      else if (typeof questionId === 'object' && questionId._id) {
        try {
          qid = new ObjectId(questionId._id || questionId);
        } catch {
          qid = null;
        }
      }
    }

    const doc = {
      userId,
      questionId: qid,
      type,
      content,
      createdAt: new Date(),
    };

    const { insertedId } = await attempts.insertOne(doc);
    res.status(201).json({ _id: insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

export default router;
