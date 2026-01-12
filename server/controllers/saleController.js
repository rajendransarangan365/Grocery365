import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// @desc    Create a new sale
// @route   POST /api/sales
export const createSale = async (req, res) => {
    try {
        const { products, customerId, paymentMethod } = req.body;

        // Calculate total and update stock
        let totalAmount = 0;
        const saleProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.qty < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // FIFO Stock Deduction Logic
            let remainingQtyToDeduct = item.qty;
            let totalCostForItems = 0;

            if (product.supplyOptions && product.supplyOptions.length > 0) {
                for (const option of product.supplyOptions) {
                    if (remainingQtyToDeduct <= 0) break;

                    const availableStock = option.stock || 0;
                    if (availableStock > 0) {
                        const take = Math.min(availableStock, remainingQtyToDeduct);

                        // Deduct from this batch
                        option.stock -= take;
                        remainingQtyToDeduct -= take;

                        // Add cost
                        totalCostForItems += take * option.costPrice;
                    }
                }
            }

            // Fallback if supplyOptions didn't have enough specific stock (e.g. legacy data or mismatch)
            // We use the first option's cost (or selling price if no cost found - unlikely) for the remainder
            if (remainingQtyToDeduct > 0) {
                const fallbackCost = product.supplyOptions?.[0]?.costPrice || 0;
                totalCostForItems += remainingQtyToDeduct * fallbackCost;
            }

            // Update global qty
            product.qty -= item.qty;
            await product.save();

            totalAmount += product.sellingPrice * item.qty;

            // Calculate average cost price for this specific sale item
            const effectiveCostPrice = totalCostForItems / item.qty;

            saleProducts.push({
                product: product._id,
                qty: item.qty,
                sellingPrice: product.sellingPrice,
                costPrice: effectiveCostPrice
            });
        }

        const sale = new Sale({
            products: saleProducts,
            totalAmount,
            customerId,
            paymentMethod
        });

        const createdSale = await sale.save();

        // Update Loyalty Points if customer exists
        if (customerId) {
            const customer = await Customer.findById(customerId);
            if (customer) {
                customer.loyaltyPoints += Math.floor(totalAmount / 100); // 1 point per 100 currency units
                await customer.save();
            }
        }

        res.status(201).json(createdSale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales analytics (Daily/Monthly profit)
// @route   GET /api/sales/analytics?range=week|month|year
export const getSalesAnalytics = async (req, res) => {
    try {
        const { range = 'week' } = req.query;
        let startDate = new Date();
        let endDate = new Date();
        let groupBy = 'day'; // 'day' or 'month'

        // Determine Date Range
        if (range === 'month') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (range === 'year') {
            startDate = new Date(new Date().getFullYear(), 0, 1); // Start of current year
            groupBy = 'month';
        } else {
            // Default 'week'
            startDate.setDate(endDate.getDate() - 6);
        }
        startDate.setHours(0, 0, 0, 0); // Normalize

        // Fetch Sales in Range
        const sales = await Sale.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        let totalProfit = 0;
        let totalSalesAmount = 0;

        // Helper to format date keys
        const formatDateKey = (date) => {
            if (groupBy === 'month') {
                return date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"
            }
            return date.toDateString(); // "Fri Jan 10 2026"
        };

        // Helper to get display label
        const getDisplayLabel = (date) => {
            if (groupBy === 'month') return date.toLocaleString('default', { month: 'short' });
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }); // "Mon 10"
        };

        // Initialize Map with Zeros
        const statsMap = {};
        const steps = range === 'year' ? 12 : (range === 'month' ? 31 : 7);

        // Populate buckets
        if (groupBy === 'month') {
            for (let i = 0; i < 12; i++) {
                const d = new Date(new Date().getFullYear(), i, 1);
                const key = formatDateKey(d);
                statsMap[key] = { label: key, sales: 0, profit: 0, date: d };
            }
        } else {
            // Day steps
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const key = formatDateKey(d);
                statsMap[key] = { label: getDisplayLabel(d), sales: 0, profit: 0, date: new Date(d) };
            }
        }

        // Aggregate Data
        sales.forEach(sale => {
            totalSalesAmount += sale.totalAmount;

            let saleProfit = 0;
            sale.products.forEach(item => {
                saleProfit += (item.sellingPrice - item.costPrice) * item.qty;
            });
            totalProfit += saleProfit;

            // Add to bucket
            const saleDate = new Date(sale.createdAt);
            const key = formatDateKey(saleDate);

            // Only add if key exists (should exist given range check, but safety first)
            if (statsMap[key]) {
                statsMap[key].sales += sale.totalAmount;
                statsMap[key].profit += saleProfit;
            }
        });

        // Convert to Array
        const chartData = Object.values(statsMap);

        // Get Global Totals (Optional: could be strict to range or all time. Currently we computed Strict to Range above)
        // If users want ALL time totals in the cards but Range for chart, we might need separate queries.
        // For now, let's return All Time Totals for the big cards, and Range Totals for the chart if needed.
        // BUT the UI currently uses these values for the big cards. 
        // Let's stick to ALL TIME for the big cards? 
        // Existing implementation did: `const sales = await Sale.find({});` (All time)
        // So I should keep All Time totals separate from Chart Data.

        const allSales = await Sale.find({});
        let allTimeSales = 0;
        let allTimeProfit = 0;
        allSales.forEach(s => {
            allTimeSales += s.totalAmount;
            s.products.forEach(i => allTimeProfit += (i.sellingPrice - i.costPrice) * i.qty);
        });

        res.json({
            totalSalesAmount: allTimeSales,
            totalProfit: allTimeProfit,
            chartData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// @desc    Get sales history (paginated/limited/filtered)
// @route   GET /api/sales/history
export const getSalesHistory = async (req, res) => {
    try {
        const { date, trash } = req.query;
        let query = {};

        // 1. Filter by Bin Status
        if (trash === 'true') {
            query.isDeleted = true;
        } else {
            // Match false OR undefined (legacy data)
            query.isDeleted = { $ne: true };
        }

        // 2. Filter by Date (if provided)
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const sales = await Sale.find(query)
            .populate('customerId', 'name phone')
            .populate('products.product', 'name unit')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Trash Status (Soft Delete / Restore)
// @route   PUT /api/sales/:id/trash
export const toggleSaleTrash = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (sale) {
            sale.isDeleted = !sale.isDeleted; // Toggle
            await sale.save();
            res.json({ message: sale.isDeleted ? 'Moved to Bin' : 'Restored', isDeleted: sale.isDeleted });
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Permanently Delete Sale
// @route   DELETE /api/sales/:id
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (sale) {
            await sale.deleteOne();
            res.json({ message: 'Sale permanently deleted' });
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
