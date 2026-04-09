<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 28fb383 (feat: anchor daily sloka to 2026)
const getExpectedApiKeys = () => String(process.env.APP_API_KEY || process.env.PERMANENT_API_KEYS || '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);
<<<<<<< HEAD

const requireApiKey = (req, res, next) => {
  const expectedKeys = getExpectedApiKeys();

  // Keep local/dev flow working when key is not configured.
  if (!expectedKeys.length) {
=======
const getExpectedApiKey = () => String(process.env.APP_API_KEY || '').trim();
=======
>>>>>>> 28fb383 (feat: anchor daily sloka to 2026)

const requireApiKey = (req, res, next) => {
  const expectedKeys = getExpectedApiKeys();

  // Keep local/dev flow working when key is not configured.
<<<<<<< HEAD
  if (!expectedKey) {
>>>>>>> 51a5678 (feat: secure daily sloka and mentor APIs with shared key)
=======
  if (!expectedKeys.length) {
>>>>>>> 28fb383 (feat: anchor daily sloka to 2026)
    return next();
  }

  const receivedKey = String(req.headers['x-api-key'] || '').trim();
<<<<<<< HEAD
<<<<<<< HEAD
  if (!receivedKey || !expectedKeys.includes(receivedKey)) {
=======
  if (!receivedKey || receivedKey !== expectedKey) {
>>>>>>> 51a5678 (feat: secure daily sloka and mentor APIs with shared key)
=======
  if (!receivedKey || !expectedKeys.includes(receivedKey)) {
>>>>>>> 28fb383 (feat: anchor daily sloka to 2026)
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }

  return next();
};

module.exports = { requireApiKey };
