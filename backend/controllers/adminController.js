const cloudinary = require('cloudinary').v2;
const VideoMongo = require('../models/mongo/VideoMongo');
const fs = require('fs');

// Configure Cloudinary from env variables: CLOUDINARY_URL or specifically api_key
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadVideoToCloudinary = async (req, res) => {
  try {
    const { title, description, module, category, chapter, language, quality_levels } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Upload to Cloudinary with HLS eager transformation
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'gita-wisdom-reels',
      eager: [
        { streaming_profile: 'hd', format: 'm3u8' } // Automatically generates adaptive HLS!
      ],
      eager_async: true,
    });

    // Cleanup local temp file
    fs.unlink(file.path, () => {});

    // Note: Cloudinary provides the HLS stream asynchronously if eager_async is true,
    // but the streaming URL format is deterministic.
    const hlsUrl = result.playback_url || result.secure_url.replace(/\.[^/.]+$/, '.m3u8');

    const newVideo = await VideoMongo.create({
      title,
      description,
      video_url: result.secure_url,
      hls_url: hlsUrl,
      thumbnail: result.secure_url.replace(/\.[^/.]+$/, '.jpg'),
      module: module || 'divine',
      category: category || 'reels',
      chapter: chapter ? Number(chapter) : undefined,
      language: language || 'telugu',
      duration: result.duration, // provided by Cloudinary in seconds
      quality_levels: quality_levels ? quality_levels.split(',') : ['240p', '360p', '480p', '720p', '1080p'],
      uploadedBy: req.user?.id,
    });

    res.status(201).json({ message: 'Video uploaded and HLS processing started', video: newVideo });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Internal server error during upload', error: error.message });
  }
};
