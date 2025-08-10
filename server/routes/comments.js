const express = require('express');
const {
  addComment,
  deleteComment,
  editComment,
  getCommentsForPost
} = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/:postId', verifyToken, addComment);
router.delete('/:commentId', verifyToken, deleteComment);
router.put('/:commentId', verifyToken, editComment); // 🆕 Edit comment
router.get('/:postId', getCommentsForPost);

module.exports = router;
