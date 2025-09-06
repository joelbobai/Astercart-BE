import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Customer reference
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Store reference
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Product reference
        name: { type: String, required: true }, // Product name
        price: { type: Number, required: true }, // Product price
        quantity: { type: Number, required: true }, // Quantity of product ordered
        totalPrice: { type: Number, required: true }, // Total price for the quantity ordered
      },
    ],
    totalAmount: { type: Number, required: true }, // Total amount for the order (including taxes, fees, etc.)
    deliveryAddress: {
      address: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      lga: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled", "flagged"],
      default: "pending", // Order status
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "refunded"],
      default: "unpaid", // Payment status
    },
    createdAt: { type: Date, default: Date.now }, // Order creation timestamp
    updatedAt: { type: Date, default: Date.now }, // Order update timestamp
  },
  { timestamps: true } // Auto-generate createdAt and updatedAt
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
