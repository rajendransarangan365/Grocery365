import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true },
        sellingPrice: { type: Number, required: true }, // Store price at time of sale
        costPrice: { type: Number, required: true }, // Store cost at time of sale for profit calc
    }],
    totalAmount: { type: Number, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    paymentMethod: { type: String, default: 'Cash' },
    saleDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
