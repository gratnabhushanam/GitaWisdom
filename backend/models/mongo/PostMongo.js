const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true }, // The Group ID 
    content: { type: String, required: true, trim: true },
    authorId: { type: String, required: true }, // User ID as string
    authorName: { type: String, required: true },
    authorImage: { type: String, default: null },
    likes: { type: [String], default: [] }, // Array of User IDs
    comments: [
      {
        text: { type: String, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        authorImage: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
      }
    ]
  },
  {
    timestamps: true,
    collection: 'satsang_posts',
  }
);

module.exports = mongoose.models.PostMongo || mongoose.model('PostMongo', PostSchema);
