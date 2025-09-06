import express from "express";
import {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleBlockAdmin,
  toggleFlagAdmin,
  sendAdminInvite,
  verifyAdminInvite,
  completeAdminOnboarding,
  getLoggedInAdmin,
  updateAdminSettings,
  deleteAdmin,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/AdminControllers/adminController.js";
import { restrictFlaggedAdmin, verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// ✅ Get logged-in admin profile (using token)
router.get("/user", verifyToken, getLoggedInAdmin);

// ✅ Update profile and/or password (uses req.userId)
router.put("/user/settings", verifyToken, updateAdminSettings);

// 📦 Invite flow
router.post("/invite", verifyToken, sendAdminInvite);
router.get("/verify-invite", verifyAdminInvite);
router.post("/onboard", verifyToken, restrictFlaggedAdmin, completeAdminOnboarding);

// 🔐 Get logged-in admin full profile for admin dashboard (optional)
router.get("/profile", verifyToken, getLoggedInAdmin);

// 👥 Admin management by ID
router.get("/", getAllAdmins); // All admins
router.get("/:id", getAdminById); // Get specific admin
router.put("/:id", updateAdmin); // Update admin
router.patch("/:id/block", verifyToken, restrictFlaggedAdmin, toggleBlockAdmin); // Block/unblock
router.patch("/:id/flag", toggleFlagAdmin); // Flag/unflag

router.delete("/:id", verifyToken, restrictFlaggedAdmin, deleteAdmin);// router.delete('/:id', deleteAdmin);  

// 👥 Admin notification routes
router.patch("/read/:notificationId", verifyToken, markNotificationAsRead)
router.patch("/mark-all-read", verifyToken, markAllNotificationsAsRead)



export default router;
