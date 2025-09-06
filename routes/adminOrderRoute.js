// orderRoutes.js
import express from 'express';
import {
  getAllOrdersForAdmin,
  flagOrder,
  unflagOrder,
  createOrder,
  deleteOrder,
  getOrderStats,
} from '../controllers/AdminControllers/orderController.js'; // Adjust path based on your project structure

const router = express.Router();

router.delete('/delete', deleteOrder);
router.post('/create', createOrder);


router.get('/stats', getOrderStats);
router.get('/', getAllOrdersForAdmin);
router.put('/:id/flag', flagOrder);
router.put('/:id/unflag', unflagOrder);
export default router;
