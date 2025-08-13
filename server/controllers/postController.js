const Post = require('../models/Post');
const User = require('../models/User');
const comment = require("../models/comment")
const like = require("../models/like")

const updateUserPostsArray = async (userId) => {
  try {
    // Find all posts authored by the user
    const posts = await Post.find({ author: userId }).select('_id');

    // Extract post IDs
    const postIds = posts.map(post => post._id);

    // Update the user's posts array (overwrite)
    await User.findByIdAndUpdate(userId, { posts: postIds });

  } catch (err) {
    console.error(`Failed to update posts array for user ${userId}:`, err);
  }
};


exports.createPost = async (req, res) => {
  try {
    // 1. Create and save the post
    const post = new Post({ ...req.body, author: req.user.id });
    await post.save();

    await updateUserPostsArray(req.user.id);
    res.status(200).json({ message: "Post Created Successfully", post });
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId }).populate('author', 'name username profilePic');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name username profilePic').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get posts' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author', 'name username followers following profilePic');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Whitelist of fields that can be updated
    const allowedUpdates = ['title', 'description', 'content', 'coverImage', 'coverImageId'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    // 1. Delete all comments related to this post
    await comment.deleteMany({ postId: post._id });

    // 2. Delete all likes related to this post
    await like.deleteMany({ postId: post._id });

    // 3. Delete the post
    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};