// Seeding for the database

import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '../db/connect.js';

const DO_INSERT = process.argv.includes('--insert') || process.env.SEED_INSERT === 'true';

async function loadJson(name) {
  const p = path.join(process.cwd(), 'src', 'db', name);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const db = await connectDB();

  if (DO_INSERT) {
    if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
      throw new Error(
        'Refusing to wipe DB in production. Unset NODE_ENV=production to allow for local debugging.'
      );
    }
    console.log('SEED: dropping collections (questions, answers, users, attempts)');
    for (const nm of ['questions', 'answers', 'users', 'attempts']) {
      try {
        const exists = await db.listCollections({ name: nm }).hasNext();
        if (exists) await db.collection(nm).drop();
      } catch (e) {
        console.warn(`Could not drop ${nm}:`, e.message || e);
      }
    }
  } else {
    console.log(
      'Dry-run: no destructive actions will be taken. Use --insert or SEED_INSERT=true to write.'
    );
  }

  // Collections
  const questionsColl = db.collection('questions');
  const answersColl = db.collection('answers');
  const usersColl = db.collection('users');
  const attemptsColl = db.collection('attempts');

  // Load input files
  let questions = [];
  let canonicalAnswers = [];
  let users = [];
  let attemptsPool = [];
  try {
    questions = await loadJson('questions.json');
  } catch (e) {
    console.warn('questions.json not found');
  }
  try {
    canonicalAnswers = await loadJson('answers_all.json');
  } catch (e) {
    /* optional */
  }
  try {
    users = await loadJson('users.json');
  } catch (e) {
    /* optional */
  }
  try {
    attemptsPool = await loadJson('attempts.json');
  } catch (e) {
    // Fall back to canonical answers content
    attemptsPool = (canonicalAnswers || [])
      .map((a) => (typeof a === 'string' ? a : a.content))
      .filter(Boolean);
  }

  // Indexes
  try {
    await usersColl.createIndex({ email: 1 }, { unique: true });
  } catch (e) {
    console.warn('users email index error:', e.message || e);
  }
  try {
    await answersColl.createIndex(
      { questionId: 1, type: 1, content: 1 },
      { unique: true, name: 'uq_answers_qid_type_content' }
    );
  } catch (e) {
    /* maybe duplicates exist */
  }
  try {
    await attemptsColl.createIndex({ userId: 1 });
    await attemptsColl.createIndex({ questionId: 1 });
  } catch (e) {
    /* ignore */
  }

  // Seed questions
  const idToObjectId = {};
  if (questions && questions.length) {
    if (DO_INSERT) {
      const docs = questions.map((q) => ({
        ...q,
        createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
      }));
      try {
        const r = await questionsColl.insertMany(docs, { ordered: false });
        // Map by original array order
        for (const [idx, id] of Object.entries(r.insertedIds)) {
          const q = docs[Number(idx)];
          if (q && q.id) idToObjectId[q.id] = id;
        }
      } catch (e) {
        // If partial insert or duplicates, read back inserted questions
        console.warn('questions insert warning:', e.message || e);
        const allQ = await questionsColl.find({}).toArray();
        for (const q of allQ) if (q.id) idToObjectId[q.id] = q._id;
      }
    } else {
      console.log(`Dry-run: would insert ${questions.length} questions`);
    }
  }

  // Seed canonical answers
  if (canonicalAnswers && canonicalAnswers.length) {
    const out = [];
    for (const a of canonicalAnswers) {
      const content = a.content || (typeof a === 'string' ? a : null);
      if (!content) continue;
      // Try to find a question title quoted in the answer
      const match = content.match(/"([^"]+)"|“([^”]+)”|‘([^’]+)’/);
      let qTitle = match ? match[1] || match[2] || match[3] : null;
      let qDoc = null;
      if (qTitle) qDoc = await questionsColl.findOne({ title: qTitle });
      if (!qDoc && a.questionId && a.questionId.$oid) {
        try {
          const { ObjectId } = await import('mongodb');
          if (ObjectId.isValid(a.questionId.$oid))
            qDoc = await questionsColl.findOne({ _id: new ObjectId(a.questionId.$oid) });
        } catch (e) {}
      }
      if (!qDoc) continue; // skip orphan answers
      out.push({
        questionId: qDoc._id,
        type: a.type || 'student',
        content,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      });
    }
    if (out.length) {
      if (DO_INSERT) {
        try {
          await answersColl.insertMany(out, { ordered: false });
        } catch (e) {
          console.warn('answers insert warning:', e.message || e);
        }
        console.log(`Inserted ${out.length} canonical answers (best-effort)`);
      } else {
        console.log(`Dry-run: would insert ${out.length} canonical answers`);
      }
    }
  }

  // Seed users
  const desiredUsers = 20;
  const userDocs = [];
  if (users && users.length) {
    for (const u of users.slice(0, desiredUsers)) {
      userDocs.push({
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      });
    }
  }
  while (userDocs.length < desiredUsers) {
    const i = userDocs.length + 1;
    userDocs.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'user',
      createdAt: new Date(),
    });
  }

  if (userDocs.length) {
    if (DO_INSERT) {
      for (const u of userDocs) {
        u.passwordHash = await bcrypt.hash('password', 10);
      }
      try {
        await usersColl.insertMany(userDocs, { ordered: false });
        console.log(`Inserted ${userDocs.length} users`);
      } catch (e) {
        console.warn('users insert warning:', e.message || e);
      }
    } else {
      console.log(`Dry-run: would insert ${userDocs.length} users`);
    }
  }

  // Refresh users and question id mapping
  const allUsers = await usersColl.find({}).toArray();
  const qDocs = await questionsColl.find({}).toArray();
  const qIds = qDocs.map((q) => q._id);

  // Build attempts pool
  const pool =
    attemptsPool && attemptsPool.length
      ? attemptsPool.map((a) => (typeof a === 'string' ? a : a.content)).filter(Boolean)
      : ['Example answer'];

  // Seed attempts
  const attemptsPerUser = 25;
  const allAttemptDocs = [];
  for (const u of allUsers) {
    for (let i = 0; i < attemptsPerUser; i++) {
      allAttemptDocs.push({
        userId: u._id,
        questionId: qIds.length ? pickRandom(qIds) : null,
        type: 'user',
        content: pickRandom(pool),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)),
      });
    }
  }

  if (allAttemptDocs.length) {
    if (DO_INSERT) {
      try {
        await attemptsColl.insertMany(allAttemptDocs, { ordered: false });
        console.log(`Inserted ${allAttemptDocs.length} attempts`);
      } catch (e) {
        console.warn('attempts insert warning:', e.message || e);
      }
    } else {
      console.log(`Dry-run: would insert ${allAttemptDocs.length} attempts`);
    }
  }

  console.log('Seed complete.');
  if (!DO_INSERT)
    console.log('Run with --insert or SEED_INSERT=true to actually write and drop collections.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
