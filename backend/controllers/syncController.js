const SlokaMongo = require('../models/mongo/SlokaMongo');
const StoryMongo = require('../models/mongo/StoryMongo');
const VideoMongo = require('../models/mongo/VideoMongo');
const MovieMongo = require('../models/mongo/MovieMongo');

exports.getContentUpdates = async (req, res) => {
    try {
        const lastSyncQuery = req.query.lastSync;
        
        let lastSync;
        // If lastSync isn't provided or is invalid, we'll sync the last week by default, or return everything if explicitly requested.
        // For OTA, passing 0 or empty means full sync.
        if (!lastSyncQuery || Number(lastSyncQuery) === 0) {
            lastSync = new Date(0); // UTC Epoch (Full Sync)
        } else {
            lastSync = new Date(Number(lastSyncQuery));
        }

        // Parallel execution to pull all deltas where 'updatedAt' is strictly greater than the user's local lastSync
        const [newSlokas, newStories, newVideos, newMovies] = await Promise.all([
            SlokaMongo.find({ updatedAt: { $gt: lastSync } }).lean(),
            StoryMongo.find({ updatedAt: { $gt: lastSync } }).lean(),
            VideoMongo.find({ updatedAt: { $gt: lastSync } }).lean(),
            MovieMongo.find({ updatedAt: { $gt: lastSync } }).lean()
        ]);

        return res.status(200).json({
            status: 'success',
            serverTime: Date.now(), // Handled to the client so they record their new 'lastSync' accurately
            deltas: {
                slokas: newSlokas,
                stories: newStories,
                videos: newVideos,
                movies: newMovies,
            }
        });

    } catch (error) {
        console.error('OTA Sync Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to synchronize content deltas.' });
    }
};
