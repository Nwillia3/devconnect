const express = require("express");
const router = express.Router();

//@route GET /api/auth
//@desc authoriization
//@access Private

router.get("/", (req, res) => {
  res.send("Auth route");
});
