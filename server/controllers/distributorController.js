import Distributor from '../models/Distributor.js';

// @desc    Get all distributors
// @route   GET /api/distributors
export const getDistributors = async (req, res) => {
    try {
        const distributors = await Distributor.find({}).populate('products');
        res.json(distributors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a distributor
// @route   POST /api/distributors
export const createDistributor = async (req, res) => {
    try {
        const { name, phone, address, products } = req.body;
        const distributor = new Distributor({
            name,
            phone,
            address,
            products
        });
        const createdDistributor = await distributor.save();
        res.status(201).json(createdDistributor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
