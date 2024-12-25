const jwt = require("jsonwebtoken");
const User = require('../models/userSchema');

exports.auth = async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ msg: "Access denied. No token provided."});
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.userId).select('-authentication.password');
    if(!user)
        return res.status(404).json({msg: "Access denied. User not found."});
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    if(err.name==="TokenExpiredError")
        return res.status(401).json({msg: "Access denied. Token expired!"});
    res.status(401).json({msg: "Access denied. Invalid token"});
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.authentication.role)) {
      return res.status(403).json({ msg: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};