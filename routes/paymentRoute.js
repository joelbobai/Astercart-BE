import express from "express";
import { createPayment, deletePayment, getAllPayments, getPaymentStats } from "../controllers/AdminControllers/paymentController.js";

const router = express.Router();

router.delete('/delete/:id', deletePayment);
router.post("/create", createPayment);
router.get("/all", getAllPayments);     
router.get("/stats", getPaymentStats);


export default router;
