const mongoose = require('mongoose');

const SlokaMongoSchema = new mongoose.Schema({}, {
  strict: false,
  timestamps: true,
  collection: 'slokas',
});

module.exports = mongoose.models.SlokaMongo || mongoose.model('SlokaMongo', SlokaMongoSchema);
