import express from 'express';
import {
    registerUser,
    authUser,
    getUserProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';
import { protect as userProtect } from '../middlewares/userAuthMiddleware.js';
import { protect as adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', userProtect, getUserProfile);
router.get('/', adminProtect, getUsers);
router.get('/:id', adminProtect, getUserById);
router.put('/:id', adminProtect, updateUser);
router.delete('/:id', adminProtect, deleteUser);

export default router;
