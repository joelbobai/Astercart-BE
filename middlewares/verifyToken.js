import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyToken = (req, res, next) => {
  console.log("Verifying token...", req); // Log to check if this middleware is hit
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("Token:", token); // Log the token for debugging
  if (!token) {
    return res.status(401).send("Not authorized, no token");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    // Add the decoded user ID to the request object for further use in routes or middleware
    req.userId = decoded.id;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    console.error("Token verification failed:", error); // Log the error for debugging
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
