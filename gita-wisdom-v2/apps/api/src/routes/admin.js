const express = require('express');
const prisma = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');
const upload = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { mentorSchema, videoSchema, chapterSchema, dailySlokaSchema } = require('../validators/schemas');

const router = express.Router();

const getDayRange = (dateInput) => {
  const start = new Date(dateInput);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

router.use(requireAuth, requireAdmin);

router.get('/admin/users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })));
});

router.post('/admin/mentor', validateBody(mentorSchema), async (req, res) => {
  const created = await prisma.mentorSloka.create({ data: req.body });
  res.status(201).json(created);
});

router.get('/admin/mentor', async (req, res) => {
  const items = await prisma.mentorSloka.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

router.put('/admin/mentor/:id', validateBody(mentorSchema), async (req, res) => {
  const updated = await prisma.mentorSloka.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.delete('/admin/mentor/:id', async (req, res) => {
  await prisma.mentorSloka.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/admin/videos', validateBody(videoSchema), async (req, res) => {
  const created = await prisma.video.create({ data: req.body });
  res.status(201).json(created);
});

router.get('/admin/videos', async (req, res) => {
  const items = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

router.put('/admin/videos/:id', validateBody(videoSchema), async (req, res) => {
  const updated = await prisma.video.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.post('/admin/videos/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file is required' });

  const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'gita-wisdom',
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(req.file.buffer);
  });

  res.json({ secureUrl: uploadResult.secure_url, publicId: uploadResult.public_id });
});

router.post('/admin/chapters', validateBody(chapterSchema), async (req, res) => {
  const created = await prisma.chapter.create({ data: req.body });
  res.status(201).json(created);
});

router.get('/admin/chapters', async (req, res) => {
  const items = await prisma.chapter.findMany({ orderBy: { chapterNumber: 'asc' } });
  res.json(items);
});

router.put('/admin/chapters/:id', validateBody(chapterSchema), async (req, res) => {
  const updated = await prisma.chapter.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

router.post('/admin/daily-sloka', validateBody(dailySlokaSchema), async (req, res) => {
  const { start, end } = getDayRange(req.body.date);
  const existing = await prisma.dailySloka.findFirst({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  const created = existing
    ? await prisma.dailySloka.update({
        where: { id: existing.id },
        data: { slokaText: req.body.slokaText, meaning: req.body.meaning, audioUrl: req.body.audioUrl, date: start },
      })
    : await prisma.dailySloka.create({
        data: { ...req.body, date: start },
      });
  res.status(201).json(created);
});

router.get('/admin/daily-sloka', async (req, res) => {
  const items = await prisma.dailySloka.findMany({ orderBy: { date: 'desc' } });
  res.json(items);
});

router.put('/admin/daily-sloka/:id', validateBody(dailySlokaSchema), async (req, res) => {
  const updated = await prisma.dailySloka.update({
    where: { id: req.params.id },
    data: {
      date: getDayRange(req.body.date).start,
      slokaText: req.body.slokaText,
      meaning: req.body.meaning,
      audioUrl: req.body.audioUrl,
    },
  });
  res.json(updated);
});

router.delete('/admin/daily-sloka/:id', async (req, res) => {
  await prisma.dailySloka.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.delete('/admin/videos/:id', async (req, res) => {
  await prisma.video.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.delete('/admin/chapters/:id', async (req, res) => {
  await prisma.chapter.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
