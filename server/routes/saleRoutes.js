import express from 'express';
import { createSale, getSalesAnalytics } from '../controllers/saleController.js';

const router = express.Router();

router.route('/')
    .post(createSale);

router.get('/analytics', getSalesAnalytics);

export default router;
