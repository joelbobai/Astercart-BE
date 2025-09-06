import mongoose from "mongoose";
import Transaction from "../../models/transactionModel.js";
import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import Product from "../../models/productModel.js";
import Store from "../../models/storeModel.js";

// Get Store Dashboard Data
export const getStoreDetails = async (req, res) => {
  try {
    const { userId: storeId, userType } = req;
    if (userType !== "Store") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Aggregate summary data
    const summary = await Transaction.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } }, // Filter by store ID
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 }, // Count total transactions matching the store ID
          totalStockItems: { $sum: { $sum: "$products.quantity" } }, // Total quantity of items sold
          totalItemsLeftInStock: { $sum: 0 }, // Placeholder (requires a Product model or other logic)
          totalItemsOutOfStock: { $sum: 0 }, // Placeholder (requires a Product model or other logic)
          totalSoldItems: { $sum: { $sum: "$products.quantity" } }, // Total sold items
          totalOrderSales: { $sum: "$totalAmount" }, // Total sales amount
          totalFeesCharged: { $sum: "$fee" }, // Total fees collected

          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          failedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const storeProfile = await Store.findById(storeId).select("-password");
    // const transactions = await Transaction.find({storeId: new mongoose.Types.ObjectId(storeId)});
    res.json({
      // summary: summary[0] || {},
      storeProfile: storeProfile || {},
      // transactions: transactions || [], // Placeholder (requires additional logic to fetch transaction details)
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the dashboard data." });
  }
};
// Get Store Dashboard Data
export const updateStoreProfile = async (req, res) => {
  try {
    const { userId: storeId, userType } = req;
    if (userType !== "Store") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      phoneNumber,
      password,
      emailAddress,
      businessName,
      supportingEmail,
      supportingPhone,
      businessAddress,
      state,
      postalCode,
      lga,
      profilePhoto,
    } = req.body;

    const storeProfile = await Store.findById(storeId);

    if (!storeProfile) {
      return res.status(404).json({ message: "Store not found" });
    }

    storeProfile.email = emailAddress || storeProfile.email;
    storeProfile.name = businessName || storeProfile.name;
    storeProfile.supportingEmail =
      supportingEmail || storeProfile.supportingEmail;
    storeProfile.supportingPhone =
      supportingPhone || storeProfile.supportingPhone;
    storeProfile.storeDetails.address =
      businessAddress || storeProfile.storeDetails.address;
    storeProfile.storeDetails.state = state || storeProfile.storeDetails.state;
    storeProfile.storeDetails.lga = lga || storeProfile.storeDetails.lga;
    storeProfile.storeDetails.postalCode =
      postalCode || storeProfile.storeDetails.postalCode;
    storeProfile.picture = profilePhoto || storeProfile.picture;
    storeProfile.phoneNumber = phoneNumber || storeProfile.phoneNumber;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      storeProfile.password = hashedPassword;
    }
    const updatedStoreProfile = await storeProfile.save();

    res.status(200).json({
      message: "Store profile updated successfully",
      profile: updatedStoreProfile,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the store profile." });
  }
};

export const changeStorePassword = async (req, res) => {
  try {
    const { userId: storeId, userType } = req;
    const { oldPassword, newPassword } = req.body;
    if (userType !== "Store") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Not a store user" });
    }

    // Check if the user is authenticated
    const storeUser = await Store.findById(storeId);
    if (!storeUser) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if the old password matches the stored hash
    const isMatch = await bcrypt.compare(oldPassword, storeUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    storeUser.password = hashedPassword;
    await storeUser.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateStoreNotifications = async (req, res) => {
  try {
    const { notificationPreferences } = req.body;
    const { userId: storeId, userType } = req;

    if (userType !== "Store") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!notificationPreferences) {
      return res.status(400).json({ message: "Invalid request data." });
    }

    // Update user preferences
    const user = await Store.findByIdAndUpdate(
      storeId,
      { notificationPreferences },
      { new: true }
    );

    res.status(200).json({
      message: "Notification preferences updated successfully.",
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getStoreProducts = async (req, res) => {
  try {
    const { userId: storeId, userType } = req;
    if (userType !== "Store") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const products = await Product.find({
      storeId: new mongoose.Types.ObjectId(storeId),
    });
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();

    const formattedStores = stores.map((store) => ({
      storeId: store._id,
      name: store.name,
      address: store.storeDetails?.address || "", // safely access nested address
    }));

    res.status(200).json(formattedStores);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
};
