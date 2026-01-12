import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true }, // Path to local file
    qty: { type: Number, required: true, default: 0 },
    // costPrice: { type: Number, required: true }, // moved to supplyOptions
    sellingPrice: { type: Number, required: true },
    // distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor' }, // moved to supplyOptions
    supplyOptions: [{
        distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor' },
        costPrice: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        mfgDate: { type: Date },
        expDate: { type: Date }
    }],
    category: { type: String }, // Optional categorization
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
