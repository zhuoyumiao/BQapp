import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connect.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

function normalizeArrayField(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// get all the questions with search and pagination
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { q, tags, page = 1, limit = 20, sort = 'updatedAt:desc' } = req.query;

    const query = {};
    if (q) {
      query.$text = { $search: q };
    }

    if (tags)
      query.tags = {
        $in: String(tags)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

    const [sortField, sortOrder = 'desc'] = String(sort).split(':');

    const cursor = db
      .collection('questions')
      .find(query)
      .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1, _id: sortOrder === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const [items, total] = await Promise.all([
      cursor.toArray(),
      db.collection('questions').countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), pageSize: Number(limit) });
  } catch (e) {
    next(e);
  }
});

// get one question
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const doc = await db.collection('questions').findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

// add question
router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const { title, body } = req.body || {};
    const tags = normalizeArrayField(req.body?.tags);
    const company = normalizeArrayField(req.body?.company);
    if (!title || !body) return res.status(400).json({ error: 'title/body required' });
    const now = new Date();
    const doc = {
      title,
      body,
      tags,
      company,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await db.collection('questions').insertOne(doc);
    res.status(201).json({ _id: insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

// update question
router.put('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const { title, body } = req.body || {};
    const update = {};
    if (title !== undefined) update.title = title;
    if (body !== undefined) update.body = body;
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'tags'))
      update.tags = normalizeArrayField(req.body.tags);
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'company'))
      update.company = normalizeArrayField(req.body.company);
    update.updatedAt = new Date();

    if (Object.keys(update).length === 1) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const db = getDB();
    const result = await db
      .collection('questions')
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const doc = await db.collection('questions').findOne({ _id: new ObjectId(id) });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// delete question
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const _id = new ObjectId(req.params.id);
    const { deletedCount } = await db.collection('questions').deleteOne({ _id });
    if (!deletedCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// get answers for one question
router.get('/:id/answers', async (req, res, next) => {
  try {
    const db = getDB();
    const qid = new ObjectId(req.params.id);
    const items = await db
      .collection('answers')
      .find({ questionId: qid })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Create an answer
router.post('/:id/answers', requireRole('admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const qid = new ObjectId(req.params.id);
    const { type = 'student', content } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });

    const doc = {
      questionId: qid,
      type,
      content,
      createdAt: new Date(),
    };
    const { insertedId } = await db.collection('answers').insertOne(doc);
    res.status(201).json({ _id: insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});
export default router;
