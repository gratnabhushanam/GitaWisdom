const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/mentor');
const videoRoutes = require('./routes/videos');
const chapterRoutes = require('./routes/chapters');
const dailySlokaRoutes = require('./routes/dailySloka');
const adminRoutes = require('./routes/admin');
const { startDailySlokaCron } = require('./services/cron');

dotenv.config();

const app = express();
const allowedOrigin = process.env.FRONTEND_URL || 'https://yourdomain.com';

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) return callback(null, true);
      return callback(new Error('CORS policy blocked this origin'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(403).json({ message: 'HTTPS is required in production' });
  }
  return next();
});

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', authRoutes);
app.use('/api', mentorRoutes);
app.use('/api', videoRoutes);
app.use('/api', chapterRoutes);
app.use('/api', dailySlokaRoutes);
app.use('/api', adminRoutes);

app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'CORS denied' });
  }
  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
});

startDailySlokaCron();

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Gita Wisdom API running on ${port}`);
  console.log('Use HTTPS via reverse proxy (Nginx/Cloudflare) in production.');
});
