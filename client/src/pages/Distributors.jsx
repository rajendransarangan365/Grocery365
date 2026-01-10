import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Truck } from 'lucide-react';

const Distributors = () => {
    const [distributors, setDistributors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    const fetchDistributors = async () => {
        const res = await axios.get('/api/distributors');
        setDistributors(res.data);
    };

    useEffect(() => {
        fetchDistributors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/distributors', formData);
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', address: '' });
        fetchDistributors();
    };

    return (
        <div className="px-4 py-8 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-20 md:static">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Distributors</h1>
                    <p className="text-sm text-gray-500">Supply contacts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-3">
                {distributors.map(d => (
                    <div key={d._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                                <Truck size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{d.name}</h3>
                                <p className="text-xs text-gray-500">{d.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Address</div>
                                <div className="font-medium text-gray-900 text-xs max-w-[150px] truncate">{d.address}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {distributors.length === 0 && <div className="text-center py-8 text-gray-400">No distributors yet.</div>}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Add Distributor</h2>
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

export default Distributors;
