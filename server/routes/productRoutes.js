import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(upload.single('image'), createProduct);

router.route('/:id')
    .put(upload.single('image'), updateProduct)
    .delete(deleteProduct);

export default router;
