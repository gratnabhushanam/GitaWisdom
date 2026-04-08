const mongoose = require('mongoose');

const VideoMongoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true,
  collection: 'videos',
});

module.exports = mongoose.models.VideoMongo || mongoose.model('VideoMongo', VideoMongoSchema);
