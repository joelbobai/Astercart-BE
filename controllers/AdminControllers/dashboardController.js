import Payment from "../../models/paymentModel.js";
import { totalDashboardFunction } from "../../utils/adminHelpers/dashboardstats.js";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";
import Review from "../../models/reviewModel.js";



export const getDashboardStats = async (req, res) => {
  try {
    const completedPayments = await Payment.find({ status: "completed" });

    const totalSales = totalDashboardFunction(completedPayments, "amount");
    const totalStorePayout = totalDashboardFunction(
      completedPayments,
      "storePayout"
    );

    const totalAdminFee = totalDashboardFunction(
      completedPayments.map((p) => {
        const taxed = (p.amount * p.taxRate) / 100;
        const taxedTotal = p.amount + taxed;
        return { ...p.toObject(), adminFee: (taxedTotal * 10) / 100 };
      }),
      "adminFee"
    );

    const totalAmountMade = totalDashboardFunction(
      completedPayments.map((p) => {
        const taxed = (p.amount * p.taxRate) / 100;
        const adminFee = ((p.amount + taxed) * 10) / 100;
        return {
          ...p.toObject(),
          totalRevenue: (p.storePayout || 0) + adminFee + (p.discount || 0),
        };
      }),
      "totalRevenue"
    );

    res.status(200).json({
      totalSales,
      totalStorePayout,
      totalAdminFee,
      totalAmountMade,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
  }
};

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
          as: "storeDetails",
        },
      },
      { $unwind: { path: "$storeDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          storeName: "$storeDetails.name",
          email: "$storeDetails.email",
          address: "$storeDetails.storeDetails.address", // ✅ Important - get from nested storeDetails
          state: "$storeDetails.storeDetails.state", // ✅ Nested state
          lga: "$storeDetails.storeDetails.lga", // ✅ Nested lga
          totalOrders: 1,
        },
      },
      { $limit: 10 },
    ]);

    res.status(200).json({ topVisitedStores: topStores });
  } catch (err) {
    console.error("Top Visited Stores Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getTopRevenueStores = async (req, res) => {
  try {
    const topStores = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$store.name", // group by store name inside payment model
          totalRevenue: { $sum: "$amount" }, // total amount made
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ topRevenueStores: topStores });
  } catch (err) {
    console.error("Top Revenue Stores Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getSoldProductsByCategory = async (req, res) => {
  try {
    const completedPayments = await Payment.find({ status: "completed" });

    const productMap = {};

    completedPayments.forEach((payment) => {
      payment.products.forEach((product) => {
        const key = `${product.name}-${product.category}`; // Use both name and category as unique key

        if (!productMap[key]) {
          productMap[key] = {
            name: product.name,
            category: product.category || "Unknown",
            sold: 0,
            image: (product.images && product.images[0]) || product.image || null,
            total: 0,
          };
        }

        productMap[key].sold += 1;
        productMap[key].total += product.price || 0;
      });
    });

    const result = Object.values(productMap);

    res.status(200).json({ categorySalesSummary: result });
  } catch (error) {
    console.error("Error getting sold products:", error.message);
    res.status(500).json({ message: "Failed to get sold products" });
  }
};

export const getTopReviewedProducts = async (req, res) => {
  try {
    const productsWithReviews = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          reviewsCount: { $sum: 1 },
        },
      },
      {
        $sort: { reviewsCount: -1 }
      },
      {
        $limit: 10
      },
    ]);

    const productIds = productsWithReviews.map((r) => r._id);

    const products = await Product.find({ _id: { $in: productIds } });

    const finalResult = productsWithReviews.map((review) => {
      const matchedProduct = products.find((p) => p._id.toString() === review._id.toString());
      return {
        name: matchedProduct?.name || "Unknown",
        category: matchedProduct?.category || "Unknown",
        rating: +review.averageRating.toFixed(1),
        reviewsCount: review.reviewsCount,
        image: matchedProduct?.images?.[0] || null,
      };
    });

    res.status(200).json({ topReviewedProducts: finalResult });
  } catch (error) {
    console.error("Error fetching top reviewed products:", error.message);
    res.status(500).json({ message: "Failed to fetch top reviewed products" });
  }
};


