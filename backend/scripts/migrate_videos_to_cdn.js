// Script to migrate all existing video files and HLS segments to Vercel Blob CDN
// Usage: node scripts/migrate_videos_to_cdn.js

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const VideoMongo = require('../models/mongo/VideoMongo');
const { uploadToVercelBlob } = require('../utils/vercelBlob');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const HLS_DIR = path.join(UPLOADS_DIR, 'hls');
const REELS_DIR = path.join(UPLOADS_DIR, 'reels');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const videos = await VideoMongo.find({});
  for (const video of videos) {
    let updated = false;
    // Migrate video file
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/reels/')) {
      const fileName = path.basename(video.videoUrl);
      const localPath = path.join(REELS_DIR, fileName);
      if (fs.existsSync(localPath)) {
        const blobPath = `videos/${fileName}`;
        const cdnUrl = await uploadToVercelBlob(localPath, blobPath);
        video.videoUrl = cdnUrl;
        updated = true;
      }
    }
    // Migrate HLS master playlist and segments
    if (video.hlsUrl && video.hlsUrl.startsWith('/uploads/hls/')) {
      const hlsRel = video.hlsUrl.replace('/uploads/hls/', '');
      const hlsFolder = hlsRel.split('/')[0];
      const hlsPath = path.join(HLS_DIR, hlsFolder);
      if (fs.existsSync(hlsPath)) {
        const files = fs.readdirSync(hlsPath);
        let masterCdnUrl = '';
        for (const f of files) {
          const localPath = path.join(hlsPath, f);
          const blobPath = `videos/${hlsFolder}/${f}`;
          const cdnUrl = await uploadToVercelBlob(localPath, blobPath);
          if (f.endsWith('_master.m3u8')) masterCdnUrl = cdnUrl;
        }
        if (masterCdnUrl) {
          video.hlsUrl = masterCdnUrl;
          updated = true;
        }
      }
    }
    if (updated) {
      await video.save();
      console.log(`Migrated video: ${video.title}`);
    }
  }
  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
