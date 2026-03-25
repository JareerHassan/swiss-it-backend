import express from 'express';
import {
    registerAdmin,
    authAdmin,
    getAdminProfile,
    updateAdminProfile,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', authAdmin);
router
    .route('/profile')
    .get(protect, getAdminProfile)
    .put(protect, updateAdminProfile);

export default router;
