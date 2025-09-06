import AdminNotification from "../models/adminNotificationModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

/**
 * Send a notification to a admin
 */
export const sendAdminNotification = async (
    title,
    message,
    type,
) => {
  try {

    const admins = await User.find({ userType: "Admin" })
    const recipients = admins.map(admin=>({
        adminId: admin._id,
        seen:false
    }))
    const notification = new AdminNotification({
        title,
        message,
        type,
        recipients
    });

    await notification.save();
    console.log("Notification sent successfully.");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    console.log("Notification marked as read.");
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

/**
 * Fetch notifications for a user
 */
export const getNotifications = async (recipientId, recipientType) => {
  try {
    const notifications = await Notification.find({ recipientId, recipientType }).sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};
