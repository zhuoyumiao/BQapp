import { getDB, ObjectId } from '../db/connect.js';

// Attaches req.user when session contains userId
export async function attachUser(req, _res, next) {
  try {
    if (req.session && req.session.userId) {
      const db = getDB();
      try {
        const uid = new ObjectId(req.session.userId);
        const user = await db.collection('users').findOne({ _id: uid });
        if (user) {
          // Strip sensitive fields without creating an unused variable
          const safe = { ...user };
          delete safe.passwordHash;
          req.user = safe;
        }
      } catch {
        // Invalid id
        void 0;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
