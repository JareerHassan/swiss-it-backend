import express from 'express';
import {
    getCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(getCategories)
    .post(protect, upload.single('icon'), createCategory);

router
    .route('/active')
    .get(getActiveCategories);

router
    .route('/:id')
    .get(getCategoryById)
    .put(protect, upload.single('icon'), updateCategory)
    .delete(protect, deleteCategory);

export default router;
