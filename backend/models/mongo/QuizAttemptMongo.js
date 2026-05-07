const mongoose = require('mongoose');

const QuizAttemptMongoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserMongo',
    required: true 
  },
  quizSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSetMongo',
    required: true
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: {
    type: Map,
    of: String // Map of questionId -> selectedOption
  },
  timeSpent: { type: Number }, // in seconds
}, {
  timestamps: true,
  collection: 'quiz_attempts',
});

module.exports = mongoose.models.QuizAttemptMongo || mongoose.model('QuizAttemptMongo', QuizAttemptMongoSchema);
