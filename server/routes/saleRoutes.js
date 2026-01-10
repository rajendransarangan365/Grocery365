import express from 'express';
import { createSale, getSalesAnalytics, getSalesHistory, toggleSaleTrash, deleteSale } from '../controllers/saleController.js';

const router = express.Router();

router.route('/')
    .post(createSale);

router.get('/history', getSalesHistory);
router.put('/:id/trash', toggleSaleTrash);
router.delete('/:id', deleteSale);
router.get('/analytics', getSalesAnalytics);

export default router;
