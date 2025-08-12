const mongoose = require("mongoose");

const predefinedTags = [
  "Technology", "Design", "Career", "Startup", "AI", "Education", "Health",
  "Productivity", "Coding", "Life", "Business", "Lifestyle", "Travel", "Food",
  "Finance", "Sports", "Entertainment", "Science", "Politics", "Culture",
  "Self Improvement", "Books", "Writing", "Photography", "Parenting", "Gaming",
  "Sustainability", "Mental Health", "Relationships", "Marketing", "Programming",
  "Web Development", "Mobile Development", "UX/UI", "Freelancing", "News",
  "Cryptocurrency", "Blockchain", "Machine Learning", "Data Science", "DevOps",
  "Remote Work", "Art", "History", "Philosophy", "Spirituality", "Motivation",
  "Environment", "Product Reviews", "Fashion", "Pets", "Movies", "Music", "Events",
];

// Create default likedTags object
const defaultLikedTags = predefinedTags.reduce((acc, tag) => {
  acc[tag] = 0;
  return acc;
}, {});

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: { type: String },
  name: { type: String },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  profilePic: {
    type: String,
    default: "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg",
  },
  bio: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

  // ✅ likedTags dictionary
  likedTags: {
    type: Map,
    of: Number,
    default: defaultLikedTags,
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
