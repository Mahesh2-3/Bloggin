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
  process.env.CLIENT_URL
];

app.use((req, res, next) => {
  // Manually handle OPTIONS requests
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors({
  origin: allowedOrigins,
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
// app.options("*", cors()); 


// Routes
app.get("/", (req, res) => {
  res.send("Hey this is server");
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/Posts"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/likes", require("./routes/likes"));
app.use("/api/upload", require("./routes/upload"));

// Export for Vercel serverless
// app.listen(5000, () => {
//   console.log("Local server running on http://localhost:5000");
// });
module.exports = app;
