const express = require('express');
const { toggleLike, getLikeStatus } = require('../controllers/likeController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/:postId', verifyToken, toggleLike);
router.get('/:postId',verifyToken, getLikeStatus);

module.exports = router;
