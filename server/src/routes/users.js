import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDB } from "../db/connect.js";

const router = Router();

// Create a new user
router.post("/", async (req, res, next) => {
  try {
    const db = getDB();
    const { name, email, password, role = "user" } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password required" });
    }

    // Normalize
    const emailNorm = String(email).trim().toLowerCase();

    // Check duplicates
    const existing = await db.collection("users").findOne({ email: emailNorm });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const now = new Date();
    const doc = {
      name,
      email: emailNorm,
      role,
      passwordHash,
      createdAt: now,
    };

    const { insertedId } = await db.collection("users").insertOne(doc);

    // Return safe user object
    res
      .status(201)
      .json({ _id: insertedId, name, email: emailNorm, role, createdAt: now });
  } catch (err) {
    next(err);
  }
});

export default router;
