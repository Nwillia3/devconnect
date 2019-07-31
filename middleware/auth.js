const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  // get the token for the header
  const token = req.header("x-auth-token");

  // check if no token
  if (!token) res.status(401).json({ msg: "NO token, authorization denied" });

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
