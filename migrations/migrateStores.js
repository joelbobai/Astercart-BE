import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import Store from "../models/storeModel.js";

dotenv.config();

const migrateStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName:
        process.env.NODE_ENV === "development" ? "astercart-test" : "astercartdb",
    });

    const userStores = await User.find({ userType: "Store" });
    for (const u of userStores) {
      const storeData = {
        name: u.name,
        email: u.email,
        location: u.location,
        picture: u.picture,
        emailVerificationCode: u.emailVerificationCode,
        isEmailVerified: u.isEmailVerified,
        password: u.password,
        status: u.status,
        storeDetails: u.storeDetails,
        supportingEmail: u.supportingEmail,
        supportingPhone: u.supportingPhone,
        phoneNumber: u.phoneNumber,
        riderDetails: u.riderDetails,
        adminStatus: u.adminStatus,
        inviteToken: u.inviteToken,
        inviteTokenExpiry: u.inviteTokenExpiry,
        onboarded: u.onboarded,
        isBlocked: u.isBlocked,
        isFlagged: u.isFlagged,
        notificationPreferences: u.notificationPreferences,
        otp: u.otp,
        isOtpVerified: u.isOtpVerified,
        resetToken: u.resetToken,
        resetTokenExpiry: u.resetTokenExpiry,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };

      await Store.create(storeData);
      await User.deleteOne({ _id: u._id });
    }

    console.log(`Migrated ${userStores.length} stores`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrateStores();
