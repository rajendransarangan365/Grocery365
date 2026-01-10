
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import distributorRoutes from './routes/distributorRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.send('Grocery Inventory API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/grocery_inventory')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Export for Vercel
export default app;

// Only listen if run directly (dev mode)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
