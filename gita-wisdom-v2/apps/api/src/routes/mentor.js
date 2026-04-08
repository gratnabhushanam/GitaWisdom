const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/gita-mentor', async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ message: 'type is required' });

  const item = await prisma.mentorSloka.findFirst({ where: { type: String(type).toLowerCase() } });
  if (!item) return res.status(404).json({ message: 'No sloka found for this category' });
  return res.json(item);
});

module.exports = router;
