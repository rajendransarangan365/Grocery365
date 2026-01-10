import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Building, Phone, Mail, Globe, FileText, Type } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState({
        storeName: 'Grocery365',
        tagline: 'Premium Grocery Store',
        address: '',
        phone: '',
        email: '',
        website: '',
        gstin: '',
        footerMessage: 'Thank you for shopping with us!'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings');
            if (data) setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('/api/settings', settings);
            toast.success('Bill Settings Updated! 📄');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Bill Settings</h1>
                <p className="text-gray-500">Customize how your printed bills look</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Building size={18} /> Store Identity
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
                                <input name="storeName" value={settings.storeName} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagline</label>
                                <input name="tagline" value={settings.tagline} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Phone size={18} /> Contact Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                <input name="phone" value={settings.phone} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input name="email" value={settings.email} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <textarea name="address" value={settings.address} onChange={handleChange} rows="2" className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                                <input name="website" value={settings.website} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} /> Footer & Legal
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GSTIN (Optional)</label>
                                <input name="gstin" value={settings.gstin} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Footer Message</label>
                                <input name="footerMessage" value={settings.footerMessage} onChange={handleChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        {loading ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                    </button>
                </form>

                {/* Preview Section */}
                <div className="space-y-4 sticky top-8">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">Live Bill Preview</h3>
                    <div className="bg-white p-8 rounded-none shadow-xl border border-gray-200 min-h-[500px] flex flex-col font-mono text-gray-800 text-xs leading-relaxed relative">
                        {/* Paper Texture Effect */}
                        <div className="absolute inset-0 bg-neutral-50 mix-blend-multiply opacity-50 pointer-events-none"></div>

                        <div className="text-center space-y-1 mb-6 relative z-10">
                            <h2 className="text-xl font-black uppercase tracking-wide">{settings.storeName || 'Store Name'}</h2>
                            <p className="text-gray-500 italic">{settings.tagline}</p>
                            <p>{settings.address}</p>
                            <p>{settings.phone} {settings.email && `• ${settings.email}`}</p>
                            {settings.gstin && <p className="font-bold mt-1">GSTIN: {settings.gstin}</p>}
                        </div>

                        <div className="border-b border-black border-dashed mb-4"></div>

                        <div className="flex justify-between mb-4 relative z-10">
                            <div>
                                <p>Date: {new Date().toLocaleDateString()}</p>
                                <p>Bill No: 001</p>
                            </div>
                            <div className="text-right">
                                <p>Customer: Guest</p>
                            </div>
                        </div>

                        {/* Fake Table */}
                        <table className="w-full mb-6 relative z-10">
                            <thead className="border-b border-black">
                                <tr className="text-left">
                                    <th className="py-1">Item</th>
                                    <th className="py-1 text-center">Qty</th>
                                    <th className="py-1 text-right">Price</th>
                                    <th className="py-1 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="py-1">Milk Bikis</td><td className="text-center">2</td><td className="text-right">10.00</td><td className="text-right">20.00</td></tr>
                                <tr><td className="py-1">Good Day</td><td className="text-center">1</td><td className="text-right">20.00</td><td className="text-right">20.00</td></tr>
                            </tbody>
                        </table>

                        <div className="border-t border-black border-dashed pt-4 mb-8 relative z-10">
                            <div className="flex justify-between text-base font-bold">
                                <span>TOTAL</span>
                                <span>₹40.00</span>
                            </div>
                        </div>

                        <div className="mt-auto text-center space-y-2 relative z-10">
                            <p className="font-bold">{settings.footerMessage}</p>
                            {settings.website && <p className="text-gray-500">{settings.website}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
