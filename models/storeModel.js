import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    // Location (Applies to all users)
    location: {
      state: { type: String },
      lga: { type: String },
      address: { type: String },
      postalCode: { type: String },
    },
    picture: {
      type: String,
      default:
        "https://th.bing.com/th/id/R.0b0b61920a83cd95cb44e405f350a3d4?rik=8xRqENWVhYDM4w&pid=ImgRaw&r=0",
    }, // Store picture (optional)
    emailVerificationCode: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    storeDetails: {
      address: { type: String },
      state: { type: String },
      postalCode: { type: String },
      lga: { type: String },
    },
    supportingEmail: { type: String },
    supportingPhone: { type: String },
    phoneNumber: { type: String },

    // Rider-specific fields
    riderDetails: {
      vehicleType: {
        type: String,
        enum: ["Bike", "Car", "Van"],
      },
      licenseNumber: { type: String },
    },

    // Admin-specific fields
    adminStatus: {
      type: String,
      enum: ["active", "inactive", "flagged"],
      default: "inactive",
      required: function () {
        return this.userType === "Admin";
      },
      select: false,
    },
    inviteToken: { type: String, select: false },
    inviteTokenExpiry: { type: Date, select: false },
    onboarded: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },

    // Notification preferences (applies to all users)
    notificationPreferences: {
      newOrder: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      outOfStock: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
    },

    // Fields for OTP-based authentication and password resets
    otp: { type: String },
    isOtpVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt automatically
  }
);

const Store = mongoose.model("Store", storeSchema);
export default Store;
