import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // Reference to the store
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the customer
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Product reference
        name: { type: String, required: true }, // Product name
        price: { type: Number, required: true }, // Price of the product
        quantity: { type: Number, required: true }, // Quantity purchased
        totalPrice: { type: Number, required: true }, // Total price for this product (price * quantity)
      },
    ],
    totalAmount: { type: Number, required: true }, // Total amount for all products (including fees, discounts, etc.)
    fee: { type: Number, default: 0 }, // Platform fee charged on this transaction
    discount: { type: Number, default: 0 }, // Discount applied to this transaction
    taxRate: { type: Number, default: 0 }, // Tax rate applied to the totalAmount
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending", // Status of the transaction
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "refunded"],
      default: "unpaid", // Payment status
    },
    deliveryAddress: {
      address: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      lga: { type: String, required: true },
    },
    storeName: { type: String, required: true }, // Store name for quick display
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
