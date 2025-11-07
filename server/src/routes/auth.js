import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/connect.js';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const db = getDB();
    const user = await db
      .collection('users')
      .findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // set session
    req.session.userId = String(user._id);

  // Copy and remove passwordHash to avoid creating an unused binding
  const safe = { ...user };
  delete safe.passwordHash;
  res.json({ user: safe });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.status(204).send();
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: req.user });
});

export default router;
