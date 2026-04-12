const mongoose = require('mongoose');

const defaultSettings = {
  notifications: true,
  privacy: 'public',
  interests: [],
};

const defaultBenefits = {
  points: 0,
  badges: [],
};

const UserMongoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    language: { type: String, default: 'telugu' },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: null },
    settings: { type: Object, default: defaultSettings },
    benefits: { type: Object, default: defaultBenefits },
    bookmarkedSlokas: { type: [Number], default: [] },
    japaCount: { type: Number, default: 0 },
    japaMalas: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

module.exports = mongoose.models.UserMongo || mongoose.model('UserMongo', UserMongoSchema);
