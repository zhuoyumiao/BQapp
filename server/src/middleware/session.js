import cookieSession from 'cookie-session';

export function sessionMiddleware() {
  const keysRaw = process.env.SESSION_KEYS || 'dev-session-key';
  const keys = String(keysRaw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return cookieSession({
    name: 'session',
    keys,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
  });
}
