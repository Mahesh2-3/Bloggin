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
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // info.message contains "User already exists"
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(info.message)}`);
    }
    // If success:
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}&userId=${user._id}&message=${info.message}`);
  })(req, res, next);
});



// EMAIL OTP ROUTES
router.post("/email/send-otp", sendOtpToEmail);
router.post("/email/verify-otp", verifyOtp);
router.post("/email/problem",handleReportProblem);
router.post("/email/feedback",handleFeedback);
router.post("/email/forgotPassword",handleForgotPassword);
router.post("/email/verifyforgot",verifyForgotOtp);
router.put("/email/change-password",verifyToken ,changePassword);
router.put("/email/reset-password", resetPassword);


router.post("/email/login", async (req, res) => {
  const { identifier, password } = req.body;
  console.log("body",req.body)
  
  if (!identifier || !password) {
    return res.status(400).json({
      message: "Email/Username and password are required",
    });
  }
  
  try {
    // Find user
    console.log("finding user")
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    
    console.log("checking user")
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("checxking user pass")
    if (!user.password) {
      console.error("Login error: user has no password in DB", user);
      return res.status(500).json({ message: "User has no password" });
    }
    
    // Compare password
    console.log("comparing pass")
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    
    console.log("cheecking jwt secret")
    if (!process.env.JWT_SECRET) {
      console.error("Login error: JWT_SECRET is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
