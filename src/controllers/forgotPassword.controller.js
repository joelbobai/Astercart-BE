import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { generatePassword } from "easy_random_password";
import { sendOTP } from "../util/mailsender/emails.js";

export const requestOTP = async (req, res) => {
  try {
    let { email } = req.body;
    console.log("body:", email);
    email = email.toLowerCase();

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(404).json({ message: "Invalid email entered" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random token for the user
    const otp = generatePassword(6, { includeNumbers: true });
    // Generate a reset token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.resetToken = token;
    user.otp = await bcrypt.hash(otp, 10);
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send OTP via email
    sendOTP(user.email, otp);

    res.json({
      message: "Password reset email sent.",
      resetToken: user.resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const verifyOTP = async (req, res) => {
  const { otp, resetToken } = req.body;
  try {
    const user = await User.findOne({ resetToken });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid token or user not found" });
    }

    // Check OTP expiration
    if (!user.otp || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Compare hashed otp with the stored otp
    const isMatch = await bcrypt.compare(otp, user?.otp || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    user.otp = undefined;
    user.isOtpVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
//   reset password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by token
    const user = await User.findOne({ resetToken });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid token or user not found" });
    }

    // Ensure OTP was verified
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    // Check OTP expiration
    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "The OTP has expired or is invalid. Please request a new OTP.",
      });
    }

    // Reset Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.isOtpVerified = false;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
