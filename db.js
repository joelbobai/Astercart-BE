import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName:
        process.env.NODE_ENV === "development"
          ? "astercart-test"
          : "astercartdb",
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Database connection error:", err));
};
