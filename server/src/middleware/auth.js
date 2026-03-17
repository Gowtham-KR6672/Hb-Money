import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'hb-money-secret');
    const user = await User.findById(payload.id);
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({ message: 'Account unavailable.' });
    }
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
}
