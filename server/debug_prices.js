import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const products = await Product.find({});
        console.log('--- Products Debug ---');
        products.forEach(p => {
            console.log(`Name: ${p.name}, Price: ${p.sellingPrice} (Type: ${typeof p.sellingPrice})`);
        });
        process.exit();
    })
    .catch(err => console.error(err));
