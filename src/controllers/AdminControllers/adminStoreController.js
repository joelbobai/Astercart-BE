import Order from "../../models/orderModel.js";
import Store from "../../models/storeModel.js";
import { totalStoresFunction, getStoreGraphValues } from "../../util/adminHelpers/totalstores.js";
import Payment from "../../models/paymentModel.js";

// Get all stores with essential details
export const getAllRegStores = async (req, res) => {
  try {
    const stores = await Store.find().select(
      "_id name email storeDetails status createdAt"
    );

    const formattedStores = stores.map(store => ({
      storeId: store._id,
      name: store.name,
      email: store.email,
      address: store.storeDetails?.address || "N/A",
      state: store.storeDetails?.state || "N/A",
      postalCode: store.storeDetails?.postalCode || "N/A",
      lga: store.storeDetails?.lga || "N/A",
      status: store.status || "active",
      createdAt: store.createdAt,
    }));

    res.status(200).json({ stores: formattedStores });
  } catch (err) {
    console.error("Get All Reg Stores Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Block a store (sets status to 'inactive')
export const blockStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json({ message: "Store blocked successfully", store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unblockStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json({ message: "Store unblocked successfully", store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Top Visited Stores (most orders)
export const getTopVisitedStores = async (req, res) => {
  try {
    const topStores = await Order.aggregate([
      { $group: { _id: "$storeId", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { 
        $lookup: { 
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "storeDetails"
        }
      },
      { $unwind: { path: "$storeDetails", preserveNullAndEmptyArrays: true } },
      { 
        $project: {
          storeName: "$storeDetails.name",
          email: "$storeDetails.email",
          address: "$storeDetails.storeDetails.address", // ✅ Important - get from nested storeDetails
          state: "$storeDetails.storeDetails.state",     // ✅ Nested state
          lga: "$storeDetails.storeDetails.lga",          // ✅ Nested lga
          totalOrders: 1
        } 
      },
      { $limit: 10 }
    ]);

    res.status(200).json({ topVisitedStores: topStores });
  } catch (err) {
    console.error("Top Visited Stores Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getTopStoresByLocation = async (req, res) => {
  try {
    const topStores = await Order.aggregate([
      { $group: { _id: "$storeId", orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { 
        $lookup: { 
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "storeDetails"
        }
      },
      { $unwind: { path: "$storeDetails", preserveNullAndEmptyArrays: true } },
      { 
        $project: {
          storeName: "$storeDetails.name",
          email: "$storeDetails.email",
          address: "$storeDetails.storeDetails.address", // ✅
          state: "$storeDetails.storeDetails.state",     // ✅
          lga: "$storeDetails.storeDetails.lga",          // ✅
          orderCount: 1
        } 
      },
      { $limit: 10 }
    ]);

    res.status(200).json({ topStoresByLocation: topStores });
  } catch (err) {
    console.error("Top Stores by Location Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getStoreStats = async (req, res) => {
  try {
    // Find all stores
    const stores = await Store.find().select("createdAt status");

    console.log("Fetched Stores from DB:", stores.length);

    // Use your helpers!
    const totalStores = totalStoresFunction(stores);

    const activeStores = totalStoresFunction(
      stores.filter((store) => store.status === "active")
    );

    const inactiveStores = totalStoresFunction(
      stores.filter((store) => store.status === "inactive")
    );

    // New stores - calculated differently (in last 24 hours)
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const currentNewStores = stores.filter(
      (store) => new Date(store.createdAt) >= yesterday
    ).length;

    const prevDayStores = stores.filter(
      (store) => {
        const createdAtDate = new Date(store.createdAt);
        const createdAtDay = createdAtDate.toISOString().split('T')[0];
        const yesterdayDay = yesterday.toISOString().split('T')[0];
        return createdAtDay === yesterdayDay;
      }
    ).length;

    const newStores = {
      value: currentNewStores,
      percentageDifference: prevDayStores
        ? Math.round(((currentNewStores - prevDayStores) / prevDayStores) * 100)
        : 0,
      graphValues: getStoreGraphValues(stores, false), // Only today counts
    };

    res.status(200).json({
      totalStores,
      activeStores,
      inactiveStores,
      newStores,
    });
  } catch (error) {
    console.error("Store Stats Error:", error.message);
    res.status(500).json({ message: "Failed to fetch store stats", error: error.message });
  }
};
 
// GET Store Info By ID
export const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Find store by ID
    const store = await Store.findById(storeId).select("name storeDetails.address storeDetails.state");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.status(200).json({ store });
  } catch (error) {
    console.error("Get Store By Id Error:", error.message);
    res.status(500).json({ message: "Failed to fetch store", error: error.message });
  }
};

export const getSoldOrdersByStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Find the store by ID
    const store = await Store.findById(storeId).select("name");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Fetch all payments linked to this store name
    const payments = await Payment.find({ "store.name": store.name });

    const formattedOrders = payments.flatMap((payment) => {
      const totalProductPrice = payment.products.reduce((sum, product) => sum + (product.price || 0), 0);
      const taxedAmount = (totalProductPrice * (payment.taxRate || 0)) / 100;
      const priceWithTax = totalProductPrice + taxedAmount;

      const adminFee = (priceWithTax * 10) / 100; // ✅ Admin gets 10% of total price + tax
      const storePayout = priceWithTax;            // ✅ Store receives price + tax

      return payment.products.map((product) => ({
        productId: payment._id,
        name: product.name,
        price: product.price,
        adminFee: adminFee,
        storePayout: storePayout,
        createdAt: payment.createdAt,
        status: payment.status,
      }));
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching sold products:", error.message);
    res.status(500).json({ message: "Failed to fetch sold products", error: error.message });
  }
};

