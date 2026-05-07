const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  getPostsByGroup,
  createPost,
  likePost,
  commentOnPost,
  deleteGroup,
  deletePostComment,
  deletePost
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.route('/groups').get(getGroups).post(protect, createGroup);
router.route('/groups/:groupId').delete(protect, deleteGroup);
router.route('/groups/:groupId/posts').get(getPostsByGroup).post(protect, createPost);
router.delete('/posts/:postId', protect, deletePost);
router.patch('/posts/:postId/like', protect, likePost);
router.post('/posts/:postId/comment', protect, commentOnPost);
router.delete('/posts/:postId/comment/:commentId', protect, deletePostComment);

module.exports = router;
