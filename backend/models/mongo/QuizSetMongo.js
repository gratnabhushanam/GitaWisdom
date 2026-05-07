const mongoose = require('mongoose');

const QuizSetMongoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timeLimit: { type: Number, default: 0 }, // 0 means no time limit, otherwise in seconds
  thumbnail: { type: String },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserMongo' },
}, {
  timestamps: true,
  collection: 'quiz_sets',
});

module.exports = mongoose.models.QuizSetMongo || mongoose.model('QuizSetMongo', QuizSetMongoSchema);
