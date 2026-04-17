const express = require('express');
const router = express.Router();
const { getContentUpdates } = require('../controllers/syncController');

// GET /api/content/updates?lastSync=timestamp
router.get('/updates', getContentUpdates);

module.exports = router;
