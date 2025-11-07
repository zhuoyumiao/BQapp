// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js';
import questionsRouter from './routes/question.js';
import attemptsRouter from './routes/attempts.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import practiceRouter from './routes/practice.js';
import { sessionMiddleware } from './middleware/session.js';
import { attachUser } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.use(express.json());

// sessions
app.use(sessionMiddleware());
app.use(attachUser);

app.use('/api/v1/questions', questionsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/practice', practiceRouter);
app.use('/api/v1/attempts', attemptsRouter);

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// 404 for API
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, _req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
  next();
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('Failed to start server:', e);
    process.exit(1);
  });
