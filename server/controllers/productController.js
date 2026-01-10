import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('supplyOptions.distributor', 'name phone');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
export const createProduct = async (req, res) => {
    try {
        const { name, qty, sellingPrice, category, unit, supplyOptions } = req.body;
        const image = req.file ? req.file.path : null;

        if (!image) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        let parsedSupplyOptions = [];
        if (supplyOptions) {
            try {
                parsedSupplyOptions = JSON.parse(supplyOptions);
            } catch (e) {
                console.error("Error parsing supplyOptions", e);
                return res.status(400).json({ message: 'Invalid supplyOptions format' });
            }
        }

        // Calculate total qty from supply options if provided
        let totalQty = 0;
        if (parsedSupplyOptions.length > 0) {
            totalQty = parsedSupplyOptions.reduce((sum, opt) => sum + Number(opt.stock || 0), 0);
        } else {
            totalQty = Number(qty || 0); // Fallback if no options
        }

        const product = new Product({
            name,
            image,
            qty: totalQty,
            // costPrice, // removed
            sellingPrice,
            unit: unit || 'pcs', // Default to pcs
            // distributorId, // removed
            supplyOptions: parsedSupplyOptions,
            category
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const { name, qty, sellingPrice, category, unit, supplyOptions } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.qty = qty || product.qty;
            // product.costPrice = costPrice || product.costPrice;
            product.sellingPrice = sellingPrice || product.sellingPrice;
            product.unit = unit || product.unit;
            // product.distributorId = distributorId || product.distributorId;
            product.category = category || product.category;

            if (supplyOptions) {
                try {
                    const parsedOptions = JSON.parse(supplyOptions);
                    product.supplyOptions = parsedOptions;
                    // Recalculate total qty
                    product.qty = parsedOptions.reduce((sum, opt) => sum + Number(opt.stock || 0), 0);
                } catch (e) {
                    console.error("Error parsing supplyOptions", e);
                }
            } else {
                if (qty !== undefined) product.qty = qty; // Fallback update if no options sent
            }

            if (req.file) {
                product.image = req.file.path;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
