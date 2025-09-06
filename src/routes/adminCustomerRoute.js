import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  blockCustomer,
  getUserStats,
} from '../controllers/AdminControllers/userController.js'

const router = express.Router();

// CRUD Operations for Customers (Admin)
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);          
router.put('/customers/:id/:action', blockCustomer); // Block/Unblock customer

// Admin Dashboard - User Stats
router.get('/stats', getUserStats);

export default router;
