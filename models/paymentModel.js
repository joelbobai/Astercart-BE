import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String },
    name: { type: String },
    store: {
      name: { type: String },
      address: { type: String },
      state: { type: String },
      lga: { type: String },
    },
    products: [
      {
        name: { type: String, required: true }, // Product name
        price: { type: Number, required: true }, // Product price
        image: { type: String }, // Optional product image URL
        category: { type: String },
      },
    ],
    amount: { type: Number }, // Total of all product prices
    adminFee: { type: Number },
    storePayout: { type: Number },
    fee: { type: Number, default: 0 }, // Platform fee
    taxRate: { type: Number, default: 0 }, // Tax rate
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
      lowercase: true 
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
