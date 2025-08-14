const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

  const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));



app.use(express.json());

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // should be true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 7000, // 7 days
  },
}));

app.use(passport.initialize());
app.use(passport.session());
app.options("*", cors()); 


// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/Posts"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/likes", require("./routes/likes"));
app.use("/api/upload", require("./routes/upload"));

// Export for Vercel serverless
module.exports = app;
