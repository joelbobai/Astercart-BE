import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // User receiving the notification
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: false }, // Related transaction
    role: {
      type: String,
      enum: ["customer", "store", "rider", "admin"],
      required: true, // Role of the user
    },
    message: { type: String, required: true }, // Notification content
    title: { type: String, required: true }, // Notification content
    type: {
      type: String,
      enum: ["transaction", "order", "payment", "delivery", "general", 'admin'],
      required: true, // Type of notification
    },
    seen: { type: Boolean, default: false }, // Whether the notification has been read
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
