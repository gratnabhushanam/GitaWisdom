const mongoose = require('mongoose');

const StoryMongoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true,
  collection: 'stories',
});

module.exports = mongoose.models.StoryMongo || mongoose.model('StoryMongo', StoryMongoSchema);
