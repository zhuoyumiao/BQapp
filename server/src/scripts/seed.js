// Seeding for the database

import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { connectDB } from "../db/connect.js";

const DO_INSERT =
  process.argv.includes("--insert") || process.env.SEED_INSERT === "true";

function makeUser(i) {
  return {
    name: `User ${i}`,
    email: `user${i}@example.com`,
    role: "user",
    createdAt: new Date(),
  };
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function loadJson(fileName) {
  const p = path.join(process.cwd(), "src", "db", fileName);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const db = await connectDB();

  // Ensure collections exist
  const existing = await db.listCollections().toArray();
  const names = existing.map((c) => c.name);

  if (!names.includes("questions")) {
    await db.createCollection("questions");
    console.log("Created collection: questions");
  }
  if (!names.includes("users")) {
    await db.createCollection("users");
    console.log("Created collection: users");
  }
  if (!names.includes("attempts")) {
    await db.createCollection("attempts");
    console.log("Created collection: attempts");
  }

  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("attempts").createIndex({ userId: 1 });
  await db.collection("attempts").createIndex({ questionId: 1 });
  console.log("Ensured indexes on users and attempts");

  // Load questions.json into DB
  const questionsFile = await loadJson("questions.json");
  const questionsColl = db.collection("questions");

  const idToObjectId = {};
  for (const q of questionsFile) {
    const filter = { id: q.id };
    const update = { $setOnInsert: { ...q, createdAt: new Date() } };
    const res = await questionsColl.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: "after",
    });
    idToObjectId[q.id] = res.value._id;
  }
  console.log(`Ensured ${Object.keys(idToObjectId).length} questions in DB.`);

  // Create 20 users if missing
  const usersColl = db.collection("users");
  const desiredUsers = 20;
  let usersFile = [];
  try {
    usersFile = await loadJson("users.json");
    console.log(`Loaded ${usersFile.length} users from users.json`);
  } catch (err) {
    // Will generate placeholder users
  }

  const existingUsers = await usersColl
    .find({ email: /@example\.com$/ })
    .toArray();
  const existingCount = existingUsers.length;

  const usersToCreate = [];

  if (usersFile && usersFile.length) {
    for (const uf of usersFile.slice(0, desiredUsers)) {
      const email = uf.email;
      if (!existingUsers.find((u) => u.email === email)) {
        const u = {
          name: uf.name,
          email: email,
          role: uf.role || "user",
          createdAt: uf.createdAt ? new Date(uf.createdAt) : new Date(),
        };
        // keep a seed-only plaintext password in memory
        u._seedPassword = "password";
        usersToCreate.push(u);
      }
    }
  } else {
    for (let i = 1; i <= desiredUsers; i++) {
      const email = `user${i}@example.com`;
      if (!existingUsers.find((u) => u.email === email)) {
        const u = makeUser(i);
        u._seedPassword = "password";
        usersToCreate.push(u);
      }
    }
  }
  if (usersToCreate.length) {
    if (DO_INSERT) {
      // Hash passwords only when actually inserting
      for (const u of usersToCreate) {
        u.passwordHash = await bcrypt.hash(u._seedPassword || "password", 10);
        delete u._seedPassword;
      }
      const r = await usersColl.insertMany(usersToCreate);
      console.log(`Inserted ${r.insertedCount} users.`);
    } else {
      console.log(`Dry-run: would insert ${usersToCreate.length} users.`);
    }
  } else {
    console.log(
      `Found ${existingCount} existing users; no new users inserted.`
    );
  }

  const allUsers = await usersColl.find({ email: /@example\.com$/ }).toArray();

  // Load attempts.json or fall back to answers_all.json
  let answersPool = [];
  try {
    const poolRaw = await loadJson("attempts.json");
    answersPool = poolRaw
      .map((a) => (typeof a === "string" ? a : a.content))
      .filter(Boolean);
    console.log(`Loaded ${answersPool.length} entries from attempts.json`);
  } catch (err) {
    try {
      const raw = await loadJson("answers_all.json");
      answersPool = raw.map((a) => a.content).filter(Boolean);
      console.log(`Loaded ${answersPool.length} entries from answers_all.json`);
    } catch (inner) {
      console.log("No attempts pool found; will use template content.");
    }
  }

  const attemptsColl = db.collection("attempts");
  const attemptsPerUser = 25;

  for (const user of allUsers) {
    const existingAttemptsCount = await attemptsColl.countDocuments({
      userId: user._id,
    });
    const toInsert = Math.max(0, attemptsPerUser - existingAttemptsCount);
    if (toInsert <= 0) {
      console.log(
        `User ${user.email} already has ${existingAttemptsCount} attempts; skipping.`
      );
      continue;
    }

    const docs = [];
    for (let i = 0; i < toInsert; i++) {
      const qIds = Object.values(idToObjectId);
      const qid = qIds.length ? pickRandom(qIds) : null;
      const content = answersPool.length
        ? pickRandom(answersPool)
        : `S: Example answer for ${user.email}`;
      docs.push({
        userId: user._id,
        questionId: qid,
        type: "user",
        content,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
        ),
      });
    }

    if (docs.length) {
      if (DO_INSERT) {
        const r = await attemptsColl.insertMany(docs);
        console.log(`Inserted ${r.insertedCount} attempts for ${user.email}`);
      } else {
        console.log(
          `Dry-run: would insert ${docs.length} attempts for ${user.email}`
        );
      }
    }
  }

  console.log("Seeding complete.");
  if (!DO_INSERT) {
    console.log(
      "Note: this was a dry-run. To actually write data run: node src/scripts/seed.js --insert"
    );
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
