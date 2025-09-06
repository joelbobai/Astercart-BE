import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },

    color: { type: String, default: "#9CA3AF" }, // HEX color
    icon: { type: String },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
