const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  const role = String(req?.user?.role || '').toUpperCase();
  if (!req.user || role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

module.exports = { requireAuth, requireAdmin };
