const bcrypt = require("bcrypt");
const User = require("../models/User");
const sendOtp = require("../utils/sendOtp");
const jwt = require("jsonwebtoken");
const sendProblemEmail = require("../utils/sendProblemEmail");
const sendFeedbackEmail = require("../utils/sendFeedbackEmail");

exports.handleReportProblem = async (req, res) => {
  const { email, name, text } = req.body;
  if (!email || !name || !text) {
    return res
      .status(400)
      .json({ message: "Email, name, and problem are required." });
  }

  try {
    await sendProblemEmail("maheshkarna32@gmail.com", email, name, text);
    res.json({ message: "Problem reported successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send problem email." });
  }
};

exports.handleFeedback = async (req, res) => {
  const { email, name, text, rating } = req.body;
  if (!email || !name || !text || !rating) {
    return res
      .status(400)
      .json({ message: "Email, name, feedback, and rating are required." });
  }

  try {
    await sendFeedbackEmail(
      "maheshkarna32@gmail.com",
      email,
      name,
      text,
      rating
    );
    res.json({ message: "Feedback sent successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send feedback email." });
  }
};
exports.sendOtpToEmail = async (req, res) => {
  const { email, username } = req.body;

  // ✅ Check if email already registered with a password (i.e., fully registered)
  const existingEmailUser = await User.findOne({
    email,
    password: { $exists: true },
  });
  if (existingEmailUser) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  // ✅ Check if username is taken by a different user
  const existingUsernameUser = await User.findOne({ username });
  if (existingUsernameUser) {
    return res.status(400).json({ message: "Username is already taken" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires: Date.now() + 5 * 60 * 1000, // 5 min expiry
      },
      { upsert: true, new: true }
    );

    await sendOtp(email, otp); // sending OTP
    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, password, username, name } = req.body;

  const user = await User.findOne({ email, otp });

  if (!user || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return res.status(400).json({ message: "Invalid username format." });
  }
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.status(400).json({ message: "Invalid name format." });
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
    return res.status(400).json({ message: "Username already taken" });
  }
  const emailExists = await User.findOne({ email });
  if (emailExists && emailExists._id.toString() !== user._id.toString()) {
    return res.status(400).json({ message: "email already taken" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.name = name;
  user.username = username;
  user.password = hashedPassword;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Remove this line (session-based):
  // req.session.user = { id: user._id, email: user.email };

  res.json({ message: "Logged in successfully", user, token });
};
