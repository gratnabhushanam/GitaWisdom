const jwt = require('jsonwebtoken');

/**
 * Validates streaming tokens attached to protected media routes.
 * Blocks any attempt to download media files without a cryptographically signed short-lived JWT.
 */
const protectStreaming = async (req, res, next) => {
  // Extract token from query or headers
  let token = req.query.token;

  if (!token) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
  }

  // If no token exists, immediately sever connection 
  if (!token) {
    // Avoid sending heavy JSON if the client expects a video buffer. Just 403 standard.
    return res.status(403).end('Forbidden: Digital Rights Management token required for media streaming.');
  }

  try {
    // Verify token cryptographic signature using existing JWT secret
    const secret = process.env.JWT_SECRET || 'dev_secret_fallback';
    const decoded = jwt.verify(token, secret);
    
    // Ensure the token represents a valid media license
    if (decoded.license !== 'streaming_license') {
      return res.status(403).end('Forbidden: Invalid license type.');
    }

    // Handshake passed, pass stream control to actual file handlers
    next();
  } catch (error) {
    return res.status(401).end('Unauthorized: DRM License token manipulated or expired.');
  }
};

module.exports = { protectStreaming };
