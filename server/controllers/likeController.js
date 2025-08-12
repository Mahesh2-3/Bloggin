const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require("../models/User")
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ postId, userId });
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Ensure likedTags exists
    if (!user.likedTags || !(user.likedTags instanceof Map)) {
      user.likedTags = new Map(predefinedTags.map(tag => [tag, 0]));
    }

    if (existingLike) {
      // Remove like document
      await existingLike.deleteOne();

      // Remove userId from post.likes
      post.likes = post.likes.filter(id => id.toString() !== userId);
      await post.save();

      // ✅ Decrease tag counts
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (user.likedTags.has(tag) && user.likedTags.get(tag) > 0) {
            user.likedTags.set(tag, user.likedTags.get(tag) - 1);
          }
        });
      }
      await user.save();

      return res.status(200).json({
        message: 'Post unliked',
        liked: false,
        likeCount: post.likes.length
      });
    }

    // Create like
    const like = new Like({ postId, userId });
    await like.save();

    // Add userId to post.likes
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    // ✅ Increase tag counts
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        if (user.likedTags.has(tag)) {
          user.likedTags.set(tag, user.likedTags.get(tag) + 1);
        }
      });
    }
    await user.save();

    res.status(200).json({
      message: 'Post liked',
      liked: true,
      likeCount: post.likes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};




exports.getLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ postId, userId });
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.status(200).json({
      liked: !!existingLike,
      likeCount: post.likes.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch like status' });
  }
};
