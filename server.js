const express = require("express");
const app = express();
const connectDB = require("./config/db");

const users = require("./routes/api/users");
const post = require("./routes/api/post");
const profile = require("./routes/api/profile");
const auth = require("./routes/api/auth");

//initialize database
connectDB();

// Initialize middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("Port running...    ");
});

// Define the routes
app.use("/api/users", users);
app.use("/api/posts", post);
app.use("/api/profile", profile);
app.use("/api/auth", auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
