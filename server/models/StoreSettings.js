import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
    storeName: { type: String, default: 'Grocery365' },
    tagline: { type: String, default: 'Premium Grocery Store' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    gstin: { type: String, default: '' },
    footerMessage: { type: String, default: 'Thank you for shopping with us!' },
    whatsappHeader: { type: String, default: '🛒 Bill from {storeName}' },
    whatsappFooter: { type: String, default: 'Thank you for shopping with us!' },
    billFormat: { type: String, enum: ['A4', 'Thermal'], default: 'A4' }
}, { timestamps: true });

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
