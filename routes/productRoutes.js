import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(getProducts)
    .post(protect, upload.single('image'), createProduct);

router
    .route('/:id')
    .get(getProductById)
    .put(protect, upload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

export default router;
