const path = require('path');
const fs = require('fs');
const { transcodeToHLS } = require('../utils/hlsTranscoder');
const { uploadToVercelBlob } = require('../utils/vercelBlob');
const { getVideoDurationSeconds } = require('../utils/videoMetadata');
const VideoMongo = require('../models/mongo/VideoMongo');
const { mapVideo } = require('../utils/responseMappers');

// Save video metadata and trigger HLS after resumable upload
async function handleResumableUpload(req, res) {
  try {
    if (!req.resumableUpload) return res.status(400).json({ message: 'No file assembled' });
    const { filePath, fileName } = req.resumableUpload;
    const user = req.user;
    const title = req.headers['video-title'] || fileName;
    const description = req.headers['video-description'] || '';
    const tags = (req.headers['video-tags'] || '').split(',').map(t => t.trim()).filter(Boolean);
    const isKids = req.headers['video-kids'] === 'true';
    const collectionTitle = req.headers['video-collection'] || 'Bhagavad Gita';
    const category = req.headers['video-category'] || 'reels';
    const contentType = req.headers['video-content-type'] || 'short';
    const explicitSource = req.headers['video-source'];
    const moderationStatus = user && user.role === 'admin' && explicitSource !== 'user' ? 'approved' : 'pending';
    const uploadSource = user && user.role === 'admin' && explicitSource !== 'user' ? 'admin' : 'user';
    let duration = req.headers['video-duration'];
    let orientation = req.headers['video-orientation'];

    // Always probe duration if possible
    try {
      duration = await getVideoDurationSeconds(filePath);
    } catch { }

    // Validate for short-form reels
    if (contentType === 'short') {
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > 4000) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Short-form reels must be <= 4GB.' });
      }
      if (duration < 3 || duration > 1200) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Short-form reels must be between 3 and 1200 seconds.' });
      }
      let aspect = 0;
      try {
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(require('ffmpeg-static'));
        ffmpeg.setFfprobePath(require('ffprobe-static').path);
        await new Promise((resolve) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (!err && metadata && metadata.streams && metadata.streams[0]) {
              aspect = metadata.streams[0].width / metadata.streams[0].height;
            }
            resolve();
          });
        });
      } catch { }
      if (aspect && !(Math.abs(aspect - 0.56) < 0.1 || Math.abs(aspect - 1.0) < 0.1)) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Short-form reels must be 9:16 (vertical) or 1:1 (square) aspect ratio.' });
      }
    }

    // Validate for long-form videos
    if (contentType === 'long') {
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > 102400) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Long-form videos must be <= 100GB.' });
      }
      if (duration < 91 || duration > 86400) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Long-form videos must be between 91 seconds and 24 hours.' });
      }
      let aspect = 0;
      try {
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(require('ffmpeg-static'));
        ffmpeg.setFfprobePath(require('ffprobe-static').path);
        await new Promise((resolve) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (!err && metadata && metadata.streams && metadata.streams[0]) {
              aspect = metadata.streams[0].width / metadata.streams[0].height;
            }
            resolve();
          });
        });
      } catch { }
      if (aspect && aspect <= 0.8) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({ message: 'Long-form videos must not be vertical.' });
      }
    }

    // HLS transcoding
    const hlsOutputDir = path.join(__dirname, '..', 'uploads', 'hls', path.parse(fileName).name);
    await new Promise((resolve) => {
      transcodeToHLS(filePath, hlsOutputDir, 'playlist', () => resolve());
    });

    // Upload HLS files to Vercel Blob or Fallback to local
    const hlsFiles = fs.readdirSync(hlsOutputDir).filter(f => f.endsWith('.m3u8') || f.endsWith('.ts'));
    const blobBase = `videos/${path.parse(fileName).name}/`;
    let masterPlaylistCdnUrl = '';
    let videoCdnUrl = '';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        for (const f of hlsFiles) {
          const cdnUrl = await uploadToVercelBlob(path.join(hlsOutputDir, f), `${blobBase}${f}`);
          if (f.endsWith('_master.m3u8')) masterPlaylistCdnUrl = cdnUrl;
        }
        videoCdnUrl = await uploadToVercelBlob(filePath, `videos/${fileName}`);
      } catch (uploadErr) {
        console.warn('Vercel Blob upload failed, falling back to local storage:', uploadErr.message);
        masterPlaylistCdnUrl = `/uploads/hls/${path.parse(fileName).name}/${path.parse(fileName).name}_master.m3u8`;
        videoCdnUrl = `/uploads/reels/${fileName}`;
      }
    } else {
      console.warn('BLOB_READ_WRITE_TOKEN not found, falling back to local storage.');
      masterPlaylistCdnUrl = `/uploads/hls/${path.parse(fileName).name}/${path.parse(fileName).name}_master.m3u8`;
      videoCdnUrl = `/uploads/reels/${fileName}`;
    }

    // Save to MongoDB
    const newVideo = await VideoMongo.create({
      title,
      videoUrl: videoCdnUrl,
      hlsUrl: masterPlaylistCdnUrl,
      description,
      tags,
      category,
      isKids,
      collectionTitle,
      isUserReel: uploadSource === 'user',
      uploadedBy: user ? String(user._id || user.id) : undefined,
      uploadSource,
      moderationStatus,
      contentType,
      duration,
      orientation,
      likesCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      likedBy: [],
      comments: [],
    });

    res.status(201).json({ ...mapVideo(newVideo), message: 'Video uploaded and processed (CDN-backed)' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { handleResumableUpload };
