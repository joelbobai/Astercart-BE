import express from "express";

import {
  changeStorePassword,
  getAllStores,
  getStoreDetails,
  getStoreProducts,
  updateStoreNotifications,
  updateStoreProfile,
} from "../controllers/storeControllers/storeController.js";
import { verifyToken } from "../middleware/verifyToken.js";
// import validateRequest from "../middleware/validateRequest.js";
// import { profileUpdateSchema } from "../util/validations/storeValidation.js";
import {
  addToCart,
  clearCart,
  deleteCartItem,
  updateCart,
  viewCart,
} from "../controllers/cartController.js";
import {
  createProduct,
  createProducts,
  deleteProduct,
  flagProduct,
  getAllProducts,
  getAllProductsForAdmin,
  getProductById,
  unflagProduct,
  updateProduct,
  updateProductAsAdmin,
} from "../controllers/productsController.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getTopCategoriesFromPayments,
  updateCategory,
} from "../controllers/storeControllers/categoryController.js";
import {
  blockStore,
  getAllRegStores,
  getSoldOrdersByStore,
  getStoreById,
  getStoreStats,
  getTopStoresByLocation,
  getTopVisitedStores,
  unblockStore,
} from "../controllers/AdminControllers/adminStoreController.js";

const router = express.Router();

// Store routes
router.get("/", getAllStores);
router.get("/store-details", verifyToken, getStoreDetails);
router.get("/all-products", verifyToken, getStoreProducts);
router.put("/update-profile", verifyToken, updateStoreProfile);
router.put("/change-password", verifyToken, changeStorePassword);
router.put("/update-notifications", verifyToken, updateStoreNotifications);
router.post("/create-product", verifyToken, createProducts); // Admin protected

// cart routes
router.post("/add-to-cart", addToCart);
router.get("/view-cart/:customerId", viewCart);
router.put("/update-cart/:productId", updateCart); // Admin protected
router.delete("/delete-cart/:productId", deleteCartItem); // Admin protected
router.delete("/delete-cart", clearCart); // Admin protected

// Public routes
router.get("/get-all-product", getAllProducts);
router.get("/get-product/:id", getProductById);

// Admin/Store routes
router.post("/createproduct", verifyToken, createProduct); // Admin protected
router.put("/update-product/:id", updateProduct); // Admin protected
router.delete("/delete-product/:id", deleteProduct); // Admin protected
router.put("/products/:id/flag", flagProduct);
router.put("/products/:id/unflag", unflagProduct);
router.get("/get-all-products-admin", getAllProductsForAdmin);
router.put("/admin/update-product/:id", updateProductAsAdmin);
router.get("/adminstore", getAllRegStores);
router.put("/adminstore/:id/block", blockStore);
router.put("/adminstore/:id/unblock", unblockStore);
router.get("/top/visited", getTopVisitedStores);
router.get("/top/location", getTopStoresByLocation);
router.get("/adminstore/stat", getStoreStats);
router.get("/adminstore/:storeId", getStoreById); // <== ADD this
router.get("/adminstore/:storeId/orders", getSoldOrdersByStore); // <== And this

// Public routes
router.get("/getAll-category", getAllCategories);
router.get("/get-category/:id", getCategoryById);

// Admin routes
router.post("/post-category", createCategory); // Admin protected (add middleware as necessary)
router.put("/update-category/:id", updateCategory); // Admin protected
router.delete("/delete-category/:id", deleteCategory); // Admin protected
router.get("/top-categories", getTopCategoriesFromPayments);

export default router;
