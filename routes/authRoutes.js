import express from "express";
import {
  signup,
  storeSignup,
  storeLogin,
  signupCustomer,
  privateData,
  verifyEmail,
  login,
  resendVerificationCode,
} from "../controllers/authController.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  storeSignupSchema,
  customerSignupSchema,
  riderSignupSchema,
  loginSchema,
  adminSignupSchema,
  adminLoginSchema,
} from "../utils/validations/userValidation.js";
import {
  requestOTP,
  resetPassword,
  verifyOTP,
} from "../controllers/forgotPassword.controller.js";
import {
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../utils/validations/passwordResetValidation.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  cancelTransaction,
  createTransaction,
  getAllTransactions,
  getTransactionDetails,
  getUserTransactions,
  updateTransactionStatus,
} from "../controllers/storeControllers/createTransaction.controller.js";
import { createReview } from "../controllers/reviewController.js";
// import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Signup routes
router.post("/signup/store", validateRequest(storeSignupSchema), storeSignup);
router.post("/signup/customer", validateRequest(customerSignupSchema), signup);
router.post("/signup/rider", validateRequest(riderSignupSchema), signup);
router.post(
  "/signup/customers",
  validateRequest(customerSignupSchema),
  signupCustomer
);

// Forgot password and reset password routes
router.post("/request-otp", requestOTP);
router.post("/verify-otp", validateRequest(verifyOtpSchema), verifyOTP);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

// Verify email route
router.post("/verify-email", verifyEmail);

// resending email verification route
router.post("/resend-verificationcode", resendVerificationCode);

// Login route
router.post("/login", validateRequest(loginSchema), login);
// Login route
router.post("/store/login", validateRequest(loginSchema), storeLogin);

// private_data
router.get("/private_data", verifyToken, privateData);

// transaction routes
router.post("/create-transaction", createTransaction);
router.get("/transactions/:id", getTransactionDetails);
router.get("/transactions/customer/:customerId", getUserTransactions);
router.delete("/cancel-transaction/:id", cancelTransaction); // Admin protected

// Admin routes
router.get("/get-all-transactions", getAllTransactions);
router.put("/update-transaction/status/:id", updateTransactionStatus); // Admin protected
export default router;

// reviewRoutes
router.post("/create-review/:id", verifyToken, createReview);

// Admin Auth Routes
router.post("/signup/admin", validateRequest(adminSignupSchema), signup);
router.post("/login/admin", validateRequest(adminLoginSchema), login);
