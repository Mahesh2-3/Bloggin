const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // should be true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 7000, // 7 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", require("./routes/auth"));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/Posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/upload', require('./routes/upload'));

app.listen(5000, () => console.log("Server started on port 5000"));
