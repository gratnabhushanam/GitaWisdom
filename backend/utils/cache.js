// backend/utils/cache.js
const cache = new Map();

/**
 * Basic In-Memory Cache Implementation
 */
const setCache = (key, data, ttlSeconds = 300) => {
    cache.set(key, {
        data,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
    // Cleanup old items to prevent memory leak
    if (cache.size > 500) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
};

const getCache = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    
    return item.data;
};

const clearCache = (keyPrefix = '') => {
    if (!keyPrefix) {
        cache.clear();
        return;
    }
    
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) {
            cache.delete(key);
        }
    }
};

const getCacheStats = () => {
    return {
        keys: cache.size,
        memoryUsage: process.memoryUsage().heapUsed,
    };
};

module.exports = {
    setCache,
    getCache,
    clearCache,
    getCacheStats
};
