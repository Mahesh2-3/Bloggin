const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendGeneratedPassword = require("../utils/sendPassword")

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.CLIENT_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const authMode = req.query.state; // 👈 state comes from OAuth

      let user = await User.findOne({ email: profile.emails[0].value });

      if (authMode === "signup") {
        if (user) return done(null, false, { message: "User already exists" });

        try {
          const username = profile.displayName
            .toLowerCase()
            .replace(/\s+/g, "");
          const plainPassword = Math.random().toString(36).slice(-8); // store before hashing
          const hashedPassword = await bcrypt.hash(plainPassword, 10);

          user = await User.create({
            username,
            email: profile.emails[0].value,
            name: profile.displayName,
            password: hashedPassword,
            profilePic: profile.photos[0]?.value || "",
          });

          // Send email with generated password
          await sendGeneratedPassword(user.email, plainPassword);

          return done(null, user, {message : "newAccount"});
        } catch (error) {
          return done(error, null);
        }
      }

      if (authMode === "login") {
        if (!user)
          return done(null, false, {
            message: "No account found. Please sign up.",
          });
        return done(null, user);
      }

      return done(null, false, { message: "Invalid auth mode" });
    }
  )
);

// Required for session support
passport.serializeUser((user, done) => {
  done(null, user._id); // Store only the user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Re-fetch full user object by ID
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
