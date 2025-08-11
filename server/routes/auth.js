const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  sendOtpToEmail,
  verifyOtp,
  handleReportProblem,
  handleFeedback,
  verifyForgotOtp,
  handleForgotPassword,
  changePassword,
  resetPassword,
} = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// GOOGLE SIGNUP ROUTE
router.get(
  "/google/signup",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "signup", // using state instead of session
  })
);

// GOOGLE LOGIN ROUTE
router.get(
  "/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "login", // using state instead of session
  })
);


// GOOGLE CALLBACK ROUTE
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google`,
  }),
  (req, res) => {
    const user = req.user;

    // Create JWT token
    const token  = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Instead of redirecting directly, redirect with token in query
    res.redirect(
  `${process.env.CLIENT_URL}/google-auth?token=${token}&userId=${user._id}`
);

  }
);


// EMAIL OTP ROUTES
router.post("/email/send-otp", sendOtpToEmail);
router.post("/email/verify-otp", verifyOtp);
router.post("/email/problem",handleReportProblem);
router.post("/email/feedback",handleFeedback);
router.post("/email/forgotPassword",handleForgotPassword);
router.post("/email/verifyforgot",verifyForgotOtp);
router.put("/email/change-password",verifyToken ,changePassword);
router.put("/email/reset-password" ,resetPassword);

router.post("/email/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email/Username and password are required" });
  }

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // If you want to start a session:
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ message: "Login successful", user, token });


    // OR if you're using JWT (let me know if you want this instead)

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
