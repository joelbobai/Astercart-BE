import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyToken = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).send("Not authorized, no token");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add the decoded user details to the request object for further use in routes or middleware
    req.userId = decoded.id;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    return res.status(401).send(`${error} Not authorized, token failed`);
  }
};

export const restrictFlaggedAdmin = async (req, res, next) => {
  const admin = await User.findById(req.userId);
  if (admin?.userType === "Admin" && admin.isFlagged) {
    return res.status(403).json({ message: "Access denied: You are flagged." });
  }
  next();
};
