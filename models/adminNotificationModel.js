import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, // Notification content
    title: { type: String, required: true }, // Notification content
    type: {
      type: String,
      enum: ["transaction", "order", "payment", "delivery", "general", 'admin'],
      required: true, // Type of notification
    },
    recipients: [
      {
        adminId: {type:mongoose.Schema.Types.ObjectId, ref:"users"},
        seen:Boolean,
        seenAt:Date
      }
    ], // Whether the notification has been read
  },
  { timestamps: true }
);

const AdminNotification = mongoose.model("AdminNotification", notificationSchema);
export default AdminNotification;
