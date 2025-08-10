const express = require('express');
const { createPost, getPostById, updatePost, deletePost, getAllPosts, getPostsByUserId } = require('../controllers/postController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createPost);
router.get('/', getAllPosts);
router.get('/:postId', getPostById);
router.put('/:postId', verifyToken, updatePost);
router.delete('/:postId', verifyToken, deletePost);
router.get('/user/:userId', getPostsByUserId); 

module.exports = router;
