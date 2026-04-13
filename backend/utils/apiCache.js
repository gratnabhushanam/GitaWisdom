/**
 * Ultra-fast In-Memory API Cache Middleware
 * designed to protect the MongoDB database from heavy request streams.
 */

const cache = new Map();

/**
 * Returns an express middleware function that caches endpoints.
 * @param {number} durationSeconds - amount of seconds to serve from RAM instead of DB
 */
function apiCache(durationSeconds = 15) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Isolate by URL and query params
    const key = `__api_cache__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      // Already cached! 0 database queries used. 
      // Serve it immediately from RAM.
      return res.status(200).json(cachedBody);
    } else {
      // Not cached. Capture the final output by hijacking res.json()
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Only cache successful requests
        // Wait till final output so any mappings/scrubbing is complete
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body);

          setTimeout(() => {
            cache.delete(key);
          }, durationSeconds * 1000); // clear cache when TTL expires
        }
        
        return originalJson(body);
      };
      
      next();
    }
  };
}

// Clear the cache manually if needed (e.g., admin action)
function clearCache() {
  cache.clear();
}

module.exports = { apiCache, clearCache };
