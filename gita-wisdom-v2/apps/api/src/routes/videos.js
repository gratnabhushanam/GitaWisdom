const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/videos', async (req, res) => {
  const { category, type } = req.query;

  const videos = await prisma.video.findMany({
    where: {
      ...(category ? { category: String(category) } : {}),
      ...(type ? { type: String(type) } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(videos);
});

module.exports = router;
