const express = require("express");
const router = express.Router();
 
// @route   GET api/users
// @desc   Test Route
// @access Public
router.get("/", (res, res) => {
    res.send ('for the users')
})