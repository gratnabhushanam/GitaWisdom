const mongoose = require('mongoose');

const VideoMongoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String },
  video_url: { type: String }, // Raw or legacy URL
  youtubeUrl: { type: String },
  url: { type: String },
  hlsUrl: { type: String },
  hls_url: { type: String }, // For HLS streaming (.m3u8)
  thumbnail: { type: String },
  module: { 
    type: String, 
    enum: ['divine', 'sloka', 'mentor', 'kids', 'other'], 
    default: 'divine' 
  },
  category: { type: String, default: 'reels' },
  collectionTitle: { type: String, default: 'Bhagavad Gita' },
  isKids: { type: Boolean, default: false },
  quizSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSetMongo' },
  tags: { type: [String], default: [] },
  isUserReel: { type: Boolean, default: false },
  moderationStatus: { type: String, default: 'approved' },
  moderationNote: { type: String, default: '' },
  contentType: { type: String, default: 'spiritual' },
  likesCount: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  savedBy: { type: [String], default: [] },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  comments: [{
    id: String,
    userId: String,
    userName: String,
    userEmail: String,
    userRole: String,
    text: String,
    createdAt: Date,
  }],
  chapter: { type: Number },
  language: { type: String, default: 'telugu' },
  duration: { type: Number }, // in seconds
  quality_levels: [{ type: String }], // '240p', '360p', '720p', etc.
  description: { type: String },
  views: { type: Number, default: 0 },
  uploadedBy: { type: String },
}, {
  timestamps: true,
  collection: 'videos',
  strict: false // allow dynamic fields for backward compatibility
});

module.exports = mongoose.models.VideoMongo || mongoose.model('VideoMongo', VideoMongoSchema);
