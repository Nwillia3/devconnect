const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const User = require("../../models/Users");

//@route  GET /api/auth
//@desc   authorization
//@access Private/protected route

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
  // res.send("Auth route");
});

// @route  GET api/auth
// @desc   Authenicate user & get token
// @access Public
router.post(
  "/",
  [
    check("email", " Please include valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      // see if user exiist
      let user = await User.findOne({ email });
      if (!user)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });

      //return JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
