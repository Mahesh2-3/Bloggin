const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

exports.getUserProfile = async (req, res) => {
  const identifier = req.params.userId;

  try {
    // 🔍 Try to find by username first
    let user = await User.findOne({ username: identifier }).select("-password");

    // 🧪 If not found and it's a valid ObjectId, try by ID
    if (!user && mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });
    if (currentUser.following.includes(targetUser._id))
      return res.status(400).json({ message: "Already following" });

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "User followed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });

    currentUser.following.pull(targetUser._id);
    targetUser.followers.pull(currentUser._id);
    await currentUser.save();
    await targetUser.save();

    res.json({ message: "User unfollowed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "followers",
      "username name profilePic"
    );
    res.status(200).json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "following",
      "username name profilePic"
    );
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateUserProfile = async (req, res) => {
  const { name, username, email, profilePic,bio } = req.body;
  const id = req.user.id;

  console.log("Updating user profile:", { name, username, email, profilePic, bio });

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, username, email, profilePic, bio },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user.id;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // const isMatch = await user.comparePassword(oldPassword);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteUserAccount = async (req, res) => {
  const userId = req.params.userId;
  const { password } = req.body; // Get password from request body

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if password was provided
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await Post.deleteMany({ author: userId });

    // Delete user's likes
    await Like.deleteMany({ user: userId });

    // Delete user's comments
    await Comment.deleteMany({ user: userId });

    // Remove user likes from all posts
    await Post.updateMany({}, { $pull: { likes: userId } });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account and related data deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during deletion" });
  }
};

