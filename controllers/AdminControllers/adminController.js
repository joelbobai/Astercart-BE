import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AdminUrl } from "../../utils/constants.js";
import { sendNewAdmin } from "../../utils/mailsender/emails.js";
import { sendAdminNotification } from "../../utils/notificationHelper.js";
import Notification from "../../models/notificationModel.js";
import AdminNotification from "../../models/adminNotificationModel.js";

// ✅ Get currently logged-in admin by token ID
export const getLoggedInAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.userId, userType: "Admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const notifications = await AdminNotification.find({
      recipients: {
        $elemMatch: {
          adminId: req.userId,
          seen: false,
        },
      },
    }).sort({
      createdAt: -1,
    });

    const formatted = notifications.map((notification) => {
      const recipientInfo = notification.recipients.find(
        (r) => r.adminId.toString() === req.userId
      );

      return {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        seen: recipientInfo.seen || false,
        seenAt: recipientInfo.seenAt || null,
      };
    });
    console.log({ NOTIFICATION: formatted });

    res.status(200).json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        picture: admin.picture || null,
      },
      notifications: formatted,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch admin data", error: error.message });
  }
};

// Admin Settings Update
export const updateAdminSettings = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      oldPass,
      newPass,
      confirmPass,
    } = req.body;

    // Use req.userId instead of req.params.id
    const admin = await User.findOne({ _id: req.userId, userType: "Admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (firstName || lastName) {
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();
      admin.name = fullName;
    }
    if (email) admin.email = email;
    if (phoneNumber) admin.phoneNumber = phoneNumber;

    if (oldPass || newPass || confirmPass) {
      if (!oldPass || !newPass || !confirmPass) {
        return res
          .status(400)
          .json({ message: "All password fields are required" });
      }
      if (newPass !== confirmPass) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      const isMatch = await bcrypt.compare(oldPass, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPass, 10);
      admin.password = hashedPassword;
    }

    await admin.save();

    res.status(200).json({
      message: "Settings updated successfully",
      admin: {
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        createdAt: admin.createdAt,
        adminStatus: admin.adminStatus,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update settings", error: error.message });
  }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ userType: "Admin" }).select(
      "name email phoneNumber createdAt adminStatus isFlagged isBlocked"
    );

    const formatted = admins.map((admin) => admin.toObject());

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch admins", error: error.message });
  }
};

// Get single admin
export const getAdminById = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      userType: "Admin",
    }).select(
      "name email phoneNumber createdAt adminStatus isFlagged isBlocked"
    );

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const formatted = admin.toObject();

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get admin", error: error.message });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "Admin" },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("name email createdAt status isFlagged isBlocked");
    if (!updatedAdmin)
      return res.status(404).json({ message: "Admin not found" });

    const formatted = updatedAdmin.toObject();

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to update admin", error });
  }
};

// Block/unblock admin
export const toggleBlockAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, userType: "Admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Toggle blocked state
    admin.isBlocked = !admin.isBlocked;

    // ✅ Set adminStatus accordingly
    if (admin.isBlocked) {
      admin.adminStatus = "inactive";
    } else if (!admin.isFlagged) {
      // If not flagged either, revert back to active
      admin.adminStatus = "active";
    }

    await admin.save();

    const updated = await User.findById(admin._id).select(
      "name email createdAt adminStatus isFlagged isBlocked"
    );

    res.status(200).json({
      message: `Admin ${
        admin.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      admin: updated.toObject(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update block status", error: error.message });
  }
};

// Flag/unflag admin
export const toggleFlagAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, userType: "Admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.isFlagged = !admin.isFlagged;

    // Auto-set status: Flagged overrides Active/Inactive for display logic
    admin.adminStatus = admin.isFlagged ? "flagged" : "active";

    await admin.save();

    const updated = await User.findById(admin._id).select(
      "name email createdAt adminStatus isFlagged isBlocked"
    );

    res.status(200).json({
      message: `Admin ${admin.isFlagged ? "flagged" : "unflagged"}`,
      admin: updated.toObject(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update flag status", error: error.message });
  }
};

// Send invite link to admin
export const sendAdminInvite = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const { userId } = req;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // const inviteToken = crypto.randomBytes(32).toString('hex');
    // const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log("hello, checking");
    const newAdmin = await User.create({
      name,
      email,
      phoneNumber,
      userType: "Admin",
      // inviteToken,
      // inviteTokenExpiry,
      password: "placeholder",
    });
    await sendAdminNotification(
      "New Admin",
      `A new admin (${name}) has been created by ${user.name}`,
      "admin"
    );
    const link = `${AdminUrl}/signup?email=${email}&phoneNumber=${phoneNumber}`;
    // const link = `https://aster-puce.vercel.app/admin/onboard-admin?token=${inviteToken}`;
    sendNewAdmin(email, link);
    res
      .status(200)
      .json({ message: "Invite sent successfully", inviteLink: link });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send invite", error: error.message });
  }
};

// Verify invite token
export const verifyAdminInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ inviteToken: token, userType: "Admin" });
    if (!user || user.inviteTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.status(200).json({
      message: "Token verified",
      admin: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify token", error: error.message });
  }
};

// Complete admin onboarding
export const completeAdminOnboarding = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    const user = await User.findOne({ inviteToken: token, userType: "Admin" });
    if (!user || user.inviteTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.adminStatus = "active";
    user.inviteToken = null;
    user.inviteTokenExpiry = null;
    user.onboarded = true;

    await user.save();

    res.status(200).json({ message: "Admin onboarded successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to complete onboarding", error: error.message });
  }
};

// controllers/AdminControllers/adminController.js

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, userType: "Admin" });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.deleteOne({ _id: admin._id });

    res.status(200).json({
      message: `Admin '${admin.name || admin.email}' deleted successfully`,
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const adminId = req.userId;
    const { notificationId } = req.params;

    const show = await AdminNotification.updateOne(
      { _id: notificationId, "recipients.adminId": adminId },
      { $set: { "recipients.$.seen": true, "recipients.$.seenAt": new Date() } }
    );
    console.log(show);

    console.log("Notification marked as read.");
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error." });
  }
};
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const adminId = req.userId;
    const show = await AdminNotification.updateMany(
      { "recipients.adminId": adminId, "recipients.seen": false },
      {
        $set: {
          "recipients.$[elem].seen": true,
          "recipients.$[elem].seenAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "elem.adminId": adminId }],
      }
    );

    res
      .status(200)
      .json({ message: "All admin notifications marked as read." });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error." });
  }
};
