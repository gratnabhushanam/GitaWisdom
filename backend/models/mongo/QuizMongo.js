const mongoose = require('mongoose');

const QuizMongoSchema = new mongoose.Schema({
  videoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VideoMongo',
    required: true 
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct_answer: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'easy' 
  },
  explanation: { type: String }, // Shown after answering
}, {
  timestamps: true,
  collection: 'quizzes',
});

module.exports = mongoose.models.QuizMongo || mongoose.model('QuizMongo', QuizMongoSchema);
