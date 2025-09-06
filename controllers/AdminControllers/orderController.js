// controllers/orderController.js
import Order from "../../models/orderModel.js";
import { totalOrdersFunction } from "../../utils/adminHelpers/orderstat.js";

export const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name")
      .populate("storeId", "name")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => {
      const orderId = order._id.toString(); // still included for frontend references
      const customerName = order.customerId?.name || "Unknown Customer";
      const storeName = order.storeId?.name || "Unknown Store";
      const productList = order.products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        total: p.totalPrice,
        image: p.image || "", // optional image field if needed
      }));

      const total = order.totalAmount;
      const address = order.deliveryAddress?.address || "";
      const state = order.deliveryAddress?.state || "";

      return {
        _id: order._id, // ✅ now included
        orderId, // keep this if used on frontend
        customerName,
        storeName,
        products: productList,
        totalAmount: total,
        address,
        state,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        isFlagged: order.status === "pending",
      };
    });

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const flagOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const flaggedOrder = await Order.findByIdAndUpdate(
      id,
      { status: "flagged" },
      { new: true }
    );

    if (!flaggedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order flagged", order: flaggedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unflagOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const unflaggedOrder = await Order.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );

    if (!unflaggedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order unflagged", order: unflaggedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const allOrders = await Order.find();

    const totalOrders = totalOrdersFunction(allOrders);

    const completedOrders = totalOrdersFunction(
      allOrders.filter((order) => order.status === "completed")
    );

    const pendingOrders = totalOrdersFunction(
      allOrders.filter((order) => order.status === "pending")
    );

    const failedOrders = totalOrdersFunction(
      allOrders.filter((order) => order.status === "failed")
    );

    res.status(200).json({
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error.message);
    res.status(500).json({ message: "Failed to fetch order stats", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // If status is being changed to "completed", verify payment
    if (status === "completed") {
      const payment = await Payment.findOne({ orderId, status: "paid" });

      if (!payment) {
        return res.status(400).json({
          message: "Cannot mark order as completed. Payment not found or not confirmed.",
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};


export const createOrder = async (req, res) => {
    try {
      const {
        customerId,
        storeId,
        products,
        deliveryAddress,
        additionalFee = 0,
      } = req.body;
  
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "No products provided" });
      }
  
      // Calculate totals
      let totalAmount = 0;
      const formattedProducts = products.map((item) => {
        const totalPrice = item.price * item.quantity;
        totalAmount += totalPrice;
        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice,
        };
      });
  
      // Add additional fee if applicable
      totalAmount += additionalFee;
  
      const order = new Order({
        customerId,
        storeId,
        products: formattedProducts,
        totalAmount,
        deliveryAddress,
      });
  
      const savedOrder = await order.save();
      res.status(201).json({ message: "Order created successfully", order: savedOrder });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Delete an order by ID
  export const deleteOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const deleted = await Order.findByIdAndDelete(orderId);
  
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Delete order error:", error);
      res.status(500).json({ message: error.message });
    }
  };

