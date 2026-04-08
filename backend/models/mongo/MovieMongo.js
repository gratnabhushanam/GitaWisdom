const mongoose = require('mongoose');

const MovieMongoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true,
  collection: 'movies',
});

module.exports = mongoose.models.MovieMongo || mongoose.model('MovieMongo', MovieMongoSchema);
