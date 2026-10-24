// Minimal HMAC-signed tokens (no external dependency)
const crypto = require('crypto');

// Without AUTH_SECRET tokens stay valid only until the server restarts
const SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_MS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const data = verifyToken(token);
  if (!data || data.role !== 'admin') {
    return res.status(401).json({ error: 'Потрібна авторизація адміністратора' });
  }
  req.user = data;
  next();
}

module.exports = { createToken, verifyToken, requireAdmin };
