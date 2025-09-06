import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.userType !== "Admin";
      },
    },    
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["Customer", "Rider", "Store", "Admin"],
      required: true,
      index: true,
    },
    picture: { type: String, default: null },

    // Location (Applies to all users)
    location: {
      state: { type: String },
      lga: { type: String },
      address: { type: String },
      postalCode: { type: String },
    },

    // Customer-specific fields
    emailVerificationCode: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    customerStatus: {
      type: String,
      enum: ["completed", "rejected"],
      default: "completed",
      required: function () {
        return this.userType === "Customer";
      },
      select: false,
    },
    rejectedAt: {
      type: Date,
      select: false,
    },
    
    // Store-specific fields
    storeDetails: {
      address: { type: String },
      state: { type: String },
      postalCode: { type: String },
      lga: { type: String },
    },
    supportingEmail: { type: String },
    supportingPhone: { type: String },
    phoneNumber: { type: String },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    

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
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
