const Like = require('../models/Like');
const Post = require('../models/Post');

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ postId, userId });
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (existingLike) {
      // Remove like document
      await existingLike.deleteOne();

      // Remove userId from post.likes
      post.likes = post.likes.filter(id => id.toString() !== userId);
      await post.save();

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
