import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    promoName: { type: String, required: true },
    store: {
      name: { type: String, required: true },
      address: { type: String, required: true }, // ✅ Include address
    },
    category: { type: String, required: true },
    product: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
    bannerImage: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-deactivate when endDate is passed
promoSchema.pre("save", function (next) {
  if (this.endDate && new Date() > this.endDate) {
    this.status = "inactive";
  }
  next();
});

const Promo = mongoose.model("Promo", promoSchema);
export default Promo;
