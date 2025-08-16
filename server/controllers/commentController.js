const Comment = require('../models/Comment');
const Post = require('../models/Post'); // import Post model

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    // 1. Create the comment
    const comment = new Comment({
      postId,
      user: req.user.id,
      content,
    });

    await comment.save();

    // 2. Add comment ID to the Post model's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // 3. Count total comments for that post
    const commentCount = await Comment.countDocuments({ postId });

    res.status(200).json({ comment, commentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // 1. Find the comment first
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // 2. Check if the user is authorized to delete the comment
    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    const postId = comment.postId;

    // 3. Delete the comment
    await comment.deleteOne();

    // 4. Remove the commentId from the post's comments array
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId }
    });

    // 5. Return the updated comment count
    const commentCount = await Comment.countDocuments({ postId });

    res.json({ message: 'Comment deleted', commentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    comment.content = content;
    comment.createdAt = new Date(); // Resetting createdAt to now

    await comment.save();

    const commentCount = await Comment.countDocuments({ postId: comment.postId });

    res.json({ message: 'Comment updated', comment, commentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};


// Get all comments for a post
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate('user', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};
