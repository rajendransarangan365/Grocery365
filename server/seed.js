import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Distributor from './models/Distributor.js';
import Sale from './models/Sale.js';

// Setup Env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
    {
        name: 'Fresh Avocados (2pc)',
        qty: 15,
        costPrice: 80,
        sellingPrice: 120,
        category: 'Fruits',
        unit: 'pcs',
        image: 'https://images.unsplash.com/photo-1523049673856-428689c8ae89?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Organic Bananas',
        qty: 40,
        costPrice: 40,
        sellingPrice: 60,
        category: 'Fruits',
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Red Apples (1kg)',
        qty: 25,
        costPrice: 100,
        sellingPrice: 150,
        category: 'Fruits',
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Whole Milk (1L)',
        qty: 30,
        costPrice: 50,
        sellingPrice: 65,
        category: 'Dairy',
        unit: 'l',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Greek Yogurt',
        qty: 10,
        costPrice: 40,
        sellingPrice: 80,
        category: 'Dairy',
        unit: 'nos',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Sourdough Bread',
        qty: 8,
        costPrice: 90,
        sellingPrice: 140,
        category: 'Bakery',
        unit: 'nos',
        image: 'https://images.unsplash.com/photo-1585476644321-b9a3d59e7e51?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Chocolate Croissant',
        qty: 12,
        costPrice: 60,
        sellingPrice: 95,
        category: 'Bakery',
        unit: 'pcs',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4039a0a6?auto=format&fit=crop&q=80&w=300&h=300'
    },
    {
        name: 'Orange Juice',
        qty: 20,
        costPrice: 90,
        sellingPrice: 130,
        category: 'Beverages',
        unit: 'l',
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=300&h=300'
    }
];

const customers = [
    { name: 'John Doe', phone: '9876543210', loyaltyPoints: 120, address: '123 Main St' },
    { name: 'Jane Smith', phone: '9123456780', loyaltyPoints: 450, address: '45 Park Ave' },
    { name: 'Mike Ross', phone: '9988776655', loyaltyPoints: 0, address: 'Pearson Spectre Office' }
];

const distributors = [
    { name: 'Fresh Farm Supplies', phone: '044-1234567', address: 'Rural District' },
    { name: 'City Dairy Co.', phone: '044-9876543', address: 'Industrial Estate' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // Clear existing
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Distributor.deleteMany({});
        await Sale.deleteMany({});

        console.log("Cleared Data...");

        // Insert
        const dists = await Distributor.insertMany(distributors);

        // Link products to random distributors with varying prices
        const linkedProducts = products.map(p => {
            // Pick 1-2 random distributors
            const shuffledDists = dists.sort(() => 0.5 - Math.random());
            const selectedDists = shuffledDists.slice(0, Math.floor(Math.random() * 2) + 1);

            return {
                ...p,
                supplyOptions: selectedDists.map(d => ({
                    distributor: d._id,
                    costPrice: p.costPrice + (Math.random() * 10 - 5), // Vary price by +/- 5
                    stock: Math.floor(p.qty / selectedDists.length) // Split total qty among distributors
                }))
            };
        });

        await Product.insertMany(linkedProducts);
        await Customer.insertMany(customers);

        console.log("Seeding Complete! 🌱");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
