import StoreSettings from '../models/StoreSettings.js';

// @desc    Get store settings
// @route   GET /api/settings
export const getSettings = async (req, res) => {
    try {
        // Try to find existing settings
        let settings = await StoreSettings.findOne();

        // If not found, create default
        if (!settings) {
            settings = new StoreSettings();
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update store settings
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
    try {
        let settings = await StoreSettings.findOne();

        if (!settings) {
            settings = new StoreSettings();
        }

        // Update fields
        settings.storeName = req.body.storeName || settings.storeName;
        settings.tagline = req.body.tagline || settings.tagline;
        settings.address = req.body.address || settings.address;
        settings.phone = req.body.phone || settings.phone;
        settings.email = req.body.email || settings.email;
        settings.website = req.body.website || settings.website;
        settings.gstin = req.body.gstin || settings.gstin;
        settings.gstin = req.body.gstin || settings.gstin;
        settings.footerMessage = req.body.footerMessage || settings.footerMessage;
        settings.whatsappHeader = req.body.whatsappHeader || settings.whatsappHeader;
        settings.whatsappFooter = req.body.whatsappFooter || settings.whatsappFooter;
        settings.billFormat = req.body.billFormat || settings.billFormat;

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
