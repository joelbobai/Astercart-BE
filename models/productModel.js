import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    price: { type: Number, required: true }, // Store price (original)
    quantity: { type: Number, required: true, min: 0 },
    discount: { type: Number }, // Admin discount (%)
    taxRate: { type: Number },   // Tax rate (%)
    image: { type: String },
    isActive: { type: Boolean, default: true },
    adminPrice: { type: Number }, // Final price customer sees (after discount + tax)
    storeName: { type: String },
    status: {
      type: String,
      enum: ["available", "out-of-stock", "pending"],
      default: function () {
        return this.quantity > 0 ? "available" : "out-of-stock";
      },
    },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Correct price calculation logic
productSchema.pre("save", function (next) {
  const taxRate = this.taxRate ?? 0;
  const taxedAmount = (this.price * taxRate) / 100;
  const priceWithTax = this.price + taxedAmount;
  const adminFee = (priceWithTax * 10) / 100;
  this.adminPrice = priceWithTax + adminFee;
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const price = update.price;
  const taxRate = update.taxRate ?? 0;

  if (price !== undefined) {
    const taxedAmount = (price * taxRate) / 100;
    const priceWithTax = price + taxedAmount;
    const adminFee = (priceWithTax * 10) / 100;
    update.adminPrice = priceWithTax + adminFee;
    this.setUpdate(update);
  }

  next();
});


const Product = mongoose.model("Product", productSchema);
export default Product;
