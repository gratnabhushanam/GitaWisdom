const getExpectedApiKey = () => String(process.env.APP_API_KEY || '').trim();

const requireApiKey = (req, res, next) => {
  const expectedKey = getExpectedApiKey();

  // Keep local/dev flow working when key is not configured.
  if (!expectedKey) {
    return next();
  }

  const receivedKey = String(req.headers['x-api-key'] || '').trim();
  if (!receivedKey || receivedKey !== expectedKey) {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  return next();
};

module.exports = { requireApiKey };
