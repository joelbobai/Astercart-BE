import express from 'express';
import { createPromo, getAllPromos, deletePromo } from "../controllers/AdminControllers/promoController.js";
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();


// Routes
router.post('/create', verifyToken, createPromo);
router.get('/', getAllPromos);
router.delete('/:id', deletePromo);

export default router;