import express from 'express';
import { getDistributors, createDistributor } from '../controllers/distributorController.js';

const router = express.Router();

router.route('/')
    .get(getDistributors)
    .post(createDistributor);

export default router;
