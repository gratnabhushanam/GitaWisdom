const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const { validateBody } = require('../middleware/validate');
const { loginSchema, registerAdminSchema } = require('../validators/schemas');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please try again later.' },
});

router.post('/register-admin', authLimiter, validateBody(registerAdminSchema), async (req, res) => {
  if (!process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ message: 'Admin bootstrap is disabled' });
  }

  const setupKey = req.headers['x-setup-key'];
  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ message: 'Invalid setup key' });
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existingAdmin) {
    return res.status(403).json({ message: 'Admin user already exists. Bootstrap locked.' });
  }

  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hash = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      passwordHash: hash,
      role: 'ADMIN',
    },
  });

  return res.json({ id: user.id, email: user.email, role: user.role });
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
