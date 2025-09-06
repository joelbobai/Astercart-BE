import Joi from "joi";

// Validation schema for password reset request
export const requestOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Validation schema for verifying OTP
export const verifyOtpSchema = Joi.object({
  otp: Joi.string().min(6).required(),
  resetToken: Joi.string().required(),
});

// Validation schema for resetting password
export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
  resetToken: Joi.string().required(),
});
