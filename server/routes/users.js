const express = require('express');
const { getUserProfile, followUser, unfollowUser, getFollowers, getFollowing, updateUserProfile, updateUserPassword, deleteUserAccount, getAllUsers } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', getUserProfile);
router.get('/', getAllUsers);
router.post('/:userId/follow', verifyToken, followUser);
router.delete('/:userId/unfollow', verifyToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.put('/',verifyToken,updateUserProfile)
router.put('/update-password',verifyToken,updateUserPassword)
router.delete('/:userId',verifyToken,deleteUserAccount)

module.exports = router;
