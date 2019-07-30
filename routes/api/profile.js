const express = require("express");
const router = express.Router();

//@route GET profile
//@desc retrive profiles
//@access Public

router.get("/", (req, res) => {
  res.send("Profile route");
});
