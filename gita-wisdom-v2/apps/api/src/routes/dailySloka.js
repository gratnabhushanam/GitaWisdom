const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/daily-sloka', async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const sloka = await prisma.dailySloka.findFirst({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  if (!sloka) return res.status(404).json({ message: 'No daily sloka configured for today' });
  return res.json(sloka);
});

module.exports = router;
