const mongoose = require('mongoose');

const QuizMongoSchema = new mongoose.Schema({
  // Legacy support for video quizzes
  videoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VideoMongo',
    required: false 
  },
  // New support for Quiz Sets
  quizSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSetMongo',
    required: false
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true_false', 'image_based'],
    default: 'mcq'
  },
  order: { type: Number, default: 0 },
  image: { type: String }, // Optional image URL for image-based questions
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct_answer: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  explanation: { type: String }, // Shown after answering
}, {
  timestamps: true,
  collection: 'quizzes',
});

module.exports = mongoose.models.QuizMongo || mongoose.model('QuizMongo', QuizMongoSchema);
