import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    const fetchCustomers = async () => {
        const res = await axios.get('http://localhost:5000/api/customers');
        setCustomers(res.data);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/customers', formData);
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', address: '' });
        fetchCustomers();
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await axios.delete(`http://localhost:5000/api/customers/${id}`);
            fetchCustomers();
        }
    }

    return (
        <div className="px-4 py-8 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-20 md:static">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500">Your network</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-3">
                {customers.map(c => (
                    <div key={c._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                                <p className="text-xs text-gray-500">{c.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Loyalty</div>
                                <div className="font-bold text-gray-900 text-sm">{c.loyaltyPoints}</div>
                            </div>
                            <button onClick={() => handleDelete(c._id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {customers.length === 0 && <div className="text-center py-8 text-gray-400">No customers yet.</div>}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Add Customer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text" placeholder="Name" className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="tel" placeholder="Phone" className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm" required
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <textarea
                                placeholder="Address" className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm"
                                value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-900">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
