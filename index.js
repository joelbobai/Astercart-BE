import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import { connectDB } from "./db.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Store from "./models/storeModel.js";
import Product from "./models/productModel.js";
import adminCustomerRoute from "./routes/adminCustomerRoute.js";
import adminOrderRoute from "./routes/adminOrderRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import promoRoute from "./routes/promoRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { deactivateExpiredPromos } from "./controllers/AdminControllers/promoController.js";
import cron from "node-cron";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
app.set("trust proxy", 1); // '1' if you are behind one proxy, or use 'true' to trust all proxies
app.use(express.json()); // Enable JSON parsing

// Enable CORS for all origins
app.use(cors({ origin: "*" }));

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running promo expiration check...");
  await deactivateExpiredPromos();
});

const getStoreIds = async () => {
  try {
    const stores = await Store.find({}, "_id"); // Fetch only the `_id` field of all stores
    return stores.map((store) => store._id); // Return an array of store IDs
  } catch (error) {
    console.error("Error fetching store IDs:", error);
    throw error;
  }
};

const generateProductData = (storeIds) => {
  return [
    {
      storeId: storeIds[0],
      name: "Apples",
      description: "Fresh and juicy apples.",
      price: 3.5,
      quantity: 100,
      category: "Fruits",
      images: ["https://example.com/images/apples.jpg"],
      isActive: true,
    },
    {
      storeId: storeIds[1],
      name: "Bananas",
      description: "Ripe yellow bananas.",
      price: 1.2,
      quantity: 150,
      category: "Fruits",
      images: ["https://example.com/images/bananas.jpg"],
      isActive: true,
    },
    {
      storeId: storeIds[2],
      name: "Carrots",
      description: "Crunchy and nutritious carrots.",
      price: 2.0,
      quantity: 200,
      category: "Vegetables",
      images: ["https://example.com/images/carrots.jpg"],
      isActive: true,
    },
    {
      storeId: storeIds[3],
      name: "Potatoes",
      description: "Fresh farm-grown potatoes.",
      price: 1.5,
      quantity: 300,
      category: "Vegetables",
      images: ["https://example.com/images/potatoes.jpg"],
      isActive: true,
    },
  ];
};

const populateProducts = async () => {
  try {
    const storeIds = await getStoreIds(); // Get store IDs from the database
    const products = generateProductData(storeIds); // Generate product data
    const result = await Product.insertMany(products); // Insert products into the database
    console.log("Products added successfully:", result);
  } catch (error) {
    console.error("Error populating products:", error);
  }
};

// populateProducts();

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);

// Admin routes
app.use("/api/adminCustomer", adminCustomerRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/promo", promoRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/adminOrder", adminOrderRoute);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
