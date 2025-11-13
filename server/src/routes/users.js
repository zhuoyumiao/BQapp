import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB, ObjectId } from '../db/connect.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper to strip sensitive fields
function safeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
}

// Create a user (self-service registration; always user role)
router.post('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }

    // Normalize
    const emailNorm = String(email).trim().toLowerCase();

    // Check duplicates
    const existing = await db.collection('users').findOne({ email: emailNorm });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const now = new Date();
    const doc = {
      name,
      email: emailNorm,
      role: 'user',
      passwordHash,
      createdAt: now,
    };

    const { insertedId } = await db.collection('users').insertOne(doc);

    // Return safe user object
    res
      .status(201)
      .json({ _id: insertedId, name, email: emailNorm, role: 'user', createdAt: now });
  } catch (err) {
    next(err);
  }
});

// Fetch the list of users for admins
// Fetch the current user for non-admins
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const me = req.user;
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    // If admin, allow querying and pagination
    if (me.role === 'admin') {
      const { q, page = 1, limit = 50 } = req.query;
      const filter = {};
      if (q) {
        const re = new RegExp(String(q), 'i');
        filter.$or = [{ name: re }, { email: re }];
      }
      const skip = Math.max(0, Number(page) - 1) * Number(limit);
      const cursor = db
        .collection('users')
        .find(filter)
        .project({ passwordHash: 0 })
        .skip(skip)
        .limit(Number(limit));
      const results = await cursor.toArray();
      return res.json({ users: results });
    }

    // Otherwise return only current user
    const uid = new ObjectId(me._id);
    const user = await db
      .collection('users')
      .findOne({ _id: uid }, { projection: { passwordHash: 0 } });
    return res.json({ users: [user] });
  } catch (err) {
    next(err);
  }
});

// Get a single user by id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const me = req.user;
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    let oid;
    try {
      oid = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Only admin or owner
    if (me.role !== 'admin' && String(me._id) !== String(oid)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await db.collection('users').findOne({ _id: oid });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

// Update a user
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const me = req.user;
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    let oid;
    try {
      oid = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Only for admin
    const isOwner = String(me._id) === String(oid);
    if (!isOwner && me.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { name, email, password } = req.body || {};
    const update = {};
    if (name) update.name = name;
    if (email) update.email = String(email).trim().toLowerCase();
    if (password) update.passwordHash = await bcrypt.hash(password, 10);

    // If email changed, ensure uniqueness
    if (update.email) {
      const exists = await db
        .collection('users')
        .findOne({ email: update.email, _id: { $ne: oid } });
      if (exists) return res.status(409).json({ error: 'Email already in use' });
    }

    if (Object.keys(update).length === 0)
      return res.status(400).json({ error: 'No valid fields to update' });

    const resu = await db
      .collection('users')
      .findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: 'after' });
    if (!resu.value) return res.status(404).json({ error: 'Not found' });
    res.json(safeUser(resu.value));
  } catch (err) {
    next(err);
  }
});

// Admin-only endpoint to change a user's role
router.patch('/:id/role', requireRole('admin'), async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    let oid;
    try {
      oid = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const roleRaw = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
    if (!roleRaw) return res.status(400).json({ error: 'role is required' });
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(roleRaw)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await db
      .collection('users')
      .findOneAndUpdate({ _id: oid }, { $set: { role: roleRaw } }, { returnDocument: 'after' });
    if (!updated.value) return res.status(404).json({ error: 'Not found' });
    res.json(safeUser(updated.value));
  } catch (err) {
    next(err);
  }
});

// Delete a user
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const me = req.user;
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    let oid;
    try {
      oid = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const isOwner = String(me._id) === String(oid);
    if (!isOwner && me.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const del = await db.collection('users').deleteOne({ _id: oid });
    if (del.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
