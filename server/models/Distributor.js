import mongoose from 'mongoose';

const distributorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const Distributor = mongoose.model('Distributor', distributorSchema);
export default Distributor;
