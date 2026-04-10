const getExpectedApiKeys = () => String(process.env.APP_API_KEY || process.env.PERMANENT_API_KEYS || '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);

const requireApiKey = (req, res, next) => {
  const expectedKeys = getExpectedApiKeys();

  // Keep local/dev flow working when key is not configured.
  if (!expectedKeys.length) {
    return next();
  }

  const receivedKey = String(req.headers['x-api-key'] || '').trim();
  if (!receivedKey || !expectedKeys.includes(receivedKey)) {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  return next();
};

module.exports = { requireApiKey };
