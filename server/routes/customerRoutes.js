import express from 'express';
import { getCustomers, createCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/:id').delete(deleteCustomer);

export default router;
