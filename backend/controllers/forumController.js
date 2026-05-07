const GroupMongo = require('../models/mongo/GroupMongo');
const PostMongo = require('../models/mongo/PostMongo');
const UserMongo = require('../models/mongo/UserMongo');
const { useMongoStore } = require('../utils/mongoStore');

// ----------------- GROUPS -----------------
exports.getGroups = async (req, res) => {
  try {
    if (!useMongoStore()) return res.json([]);
    const groups = await GroupMongo.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required for forums' });

    const newGroup = await GroupMongo.create({
      name,
      description,
      category,
      createdBy: String(req.user.id || req.user._id)
    });
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required for forums' });

    const group = await GroupMongo.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Community not found' });

    console.log('User attempting to delete group:', req.user);
    console.log('Group createdBy:', group.createdBy);

    // Ensure the sender is admin or creator
    if (req.user.role !== 'admin' && String(group.createdBy) !== String(req.user.id || req.user._id)) {
      console.log('Delete rejected: sender is not admin and not creator');
      return res.status(403).json({ message: 'Only admins or creators can delete communities' });
    }

    console.log('Proceeding to delete group:', group._id);

    await group.deleteOne();
    // Also delete associated posts
    await PostMongo.deleteMany({ groupId });

    res.json({ message: 'Community deleted successfully' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------- POSTS -----------------
exports.getPostsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!useMongoStore()) return res.json([]);
    const posts = await PostMongo.find({ groupId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required' });

    const user = await UserMongo.findById(req.user.id || req.user._id);
    const newPost = await PostMongo.create({
      groupId,
      content,
      authorId: String(user._id),
      authorName: user.name,
      authorImage: user.profilePicture
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required' });

    const post = await PostMongo.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (String(post.authorId) !== String(req.user.id || req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = String(req.user.id || req.user._id);
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required' });

    const post = await PostMongo.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const user = await UserMongo.findById(req.user.id || req.user._id);
    
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required' });

    const post = await PostMongo.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      text,
      authorId: String(user._id),
      authorName: user.name,
      authorImage: user.profilePicture
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePostComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    if (!useMongoStore()) return res.status(400).json({ message: 'MongoDB required' });

    const post = await PostMongo.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const commentIndex = post.comments.findIndex(c => String(c._id) === String(commentId) || String(c.id) === String(commentId));
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

    const comment = post.comments[commentIndex];
    if (String(comment.authorId) !== String(req.user.id || req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
