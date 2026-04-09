const path = require('path');
const fs = require('fs');
const { transcodeToHLS } = require('../utils/hlsTranscoder');
const { getVideoDurationSeconds } = require('../utils/videoMetadata');
const VideoMongo = require('../models/mongo/VideoMongo');
const { mapVideo } = require('../utils/responseMappers');

// Save video metadata and trigger HLS after resumable upload
async function handleResumableUpload(req, res) {
  if (!req.resumableUpload) return res.status(400).json({ message: 'No file assembled' });
  const { filePath, fileName } = req.resumableUpload;
  const user = req.user;
  const title = req.headers['video-title'] || fileName;
  const description = req.headers['video-description'] || '';
  const tags = (req.headers['video-tags'] || '').split(',').map(t => t.trim()).filter(Boolean);
  const isKids = req.headers['video-kids'] === 'true';
  const collectionTitle = req.headers['video-collection'] || 'Bhagavad Gita';
  const category = req.headers['video-category'] || 'reels';
  const moderationStatus = user && user.role === 'admin' ? 'approved' : 'pending';
  const uploadSource = user && user.role === 'admin' ? 'admin' : 'user';

  // HLS transcoding
  const hlsOutputDir = path.join(__dirname, '..', 'uploads', 'hls', path.parse(fileName).name);
  const baseName = 'playlist';
  let hlsUrl = '';
  await new Promise((resolve) => {
    transcodeToHLS(filePath, hlsOutputDir, baseName, (err, masterPlaylistPath) => {
      if (!err && masterPlaylistPath) {
        hlsUrl = `/uploads/hls/${path.parse(fileName).name}/playlist_master.m3u8`;
      }
      resolve();
    });
  });

  // Save to DB (Mongo only for now)
  const newVideo = await VideoMongo.create({
    title,
    videoUrl: `/uploads/reels/${fileName}`,
    hlsUrl,
    description,
    tags,
    category,
    isKids,
    collectionTitle,
    isUserReel: uploadSource === 'user',
    uploadedBy: user ? user.id : undefined,
    uploadSource,
    moderationStatus,
    contentType: 'spiritual',
    likesCount: 0,
    sharesCount: 0,
    commentsCount: 0,
    likedBy: [],
    comments: [],
  });
  res.status(201).json({ ...mapVideo(newVideo), message: 'Video uploaded and processed' });
}

module.exports = { handleResumableUpload };
