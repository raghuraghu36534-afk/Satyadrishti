const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getAuthPayload(req) {
  const token = req.cookies && req.cookies.token;
  return token ? verifyToken(token) : null;
}

function requireAuth(req, res, next) {
  const payload = getAuthPayload(req);
  if (!payload) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  req.userId = payload.sub;
  next();
}

module.exports = { getAuthPayload, requireAuth, verifyToken };
