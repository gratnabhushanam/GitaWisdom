const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

router.get('/chapters', async (req, res) => {
  const chapters = await prisma.chapter.findMany({ orderBy: { chapterNumber: 'asc' } });
  return res.json(chapters);
});

module.exports = router;
