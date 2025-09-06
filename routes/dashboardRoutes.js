import express from "express";
import {
  getDashboardStats,
  getTopVisitedStores,
  getTopRevenueStores,
  getSoldProductsByCategory,
  getTopReviewedProducts,
} from "../controllers/AdminControllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/topvisited", getTopVisitedStores);
router.get("/toprevenue", getTopRevenueStores);
router.get("/categorysales", getSoldProductsByCategory);
router.get("/topreviewed", getTopReviewedProducts);
export default router;
