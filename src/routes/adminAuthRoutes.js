import express from 'express';
import { signupAdmin, loginAdmin, logoutAdmin } from '../controllers/AdminControllers/adminAuthController.js';
import validateRequest from '../middleware/validateRequest.js';
import { adminSignupSchema, adminLoginSchema } from '../util/validations/userValidation.js';

const router = express.Router();

router.post('/signup', validateRequest(adminSignupSchema), signupAdmin);
router.post('/login', validateRequest(adminLoginSchema), loginAdmin);
router.post('/logout', logoutAdmin);

export default router;
