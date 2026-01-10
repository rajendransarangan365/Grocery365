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

            product.qty -= item.qty;
            await product.save();

            totalAmount += product.sellingPrice * item.qty;

            // Determine cost price (Avg or First Option) for profit calc
            // If strictly needed, we could pick the specific distributor used, but for now we take the highest cost (conservative profit) or first.
            let determinedCost = 0;
            if (product.supplyOptions && product.supplyOptions.length > 0) {
                // Use the first option's cost as default, or average. 
                // Let's use the maximum cost to be safe on profit margins? Or just the first. 
                // Let's go with the first option for simplicity as primary supplier.
                determinedCost = product.supplyOptions[0].costPrice;
            }

            saleProducts.push({
                product: product._id,
                qty: item.qty,
                sellingPrice: product.sellingPrice,
                costPrice: determinedCost
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
