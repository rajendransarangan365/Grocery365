import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, ShoppingBag, Trash2, RefreshCw, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const SalesHistory = () => {
    // Default to today in YYYY-MM-DD format
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [sales, setSales] = useState([]);
    const [view, setView] = useState('active'); // 'active' or 'bin'
    const [dailyTotal, setDailyTotal] = useState(0);

    const fetchHistory = async () => {
        try {
            const params = {
                trash: view === 'bin',
                date: date || undefined
            };
            const res = await axios.get('/api/sales/history', { params });
            setSales(res.data);

            // Calculate total for the shown list
            const total = res.data.reduce((sum, sale) => sum + sale.totalAmount, 0);
            setDailyTotal(total);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [date, view]);

    const handleTrash = async (id) => {
        if (!confirm('Move this bill to bin?')) return;
        try {
            await axios.put(`/api/sales/${id}/trash`);
            toast.success('Moved to Bin');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to move to bin');
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(`/api/sales/${id}/trash`);
            toast.success('Restored from Bin');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to restore');
        }
    };

    const handleDeleteForever = async (id) => {
        if (!confirm('Permanently delete this record? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/sales/${id}`);
            toast.success('Deleted Permanently');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Date formatting for the card
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const yearNum = dateObj.getFullYear();

    return (
        <div className="px-4 py-8 md:p-8 space-y-8 max-w-4xl mx-auto">

            {/* Header Section with Date Slip Card */}
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Date Slip Card - "The 3rd Image" Style */}
                <div className="flex-shrink-0 w-full md:w-80 bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 font-sans relative group">
                    {/* Top White Part */}
                    <div className="p-8 pb-32">
                        <div className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Sales History</div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                            {dayName},<br />
                            <span className="text-gray-400">{dayNum} {monthName}</span>
                        </h2>

                        {/* Hidden Input Overlay for Date Picking */}
                        <div className="mt-6 relative">
                            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <Calendar size={20} className="text-gray-400" />
                                <input
                                    type="date"
                                    className="bg-transparent text-sm font-bold text-gray-700 outline-none w-full uppercase"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Black Part */}
                    <div className="absolute bottom-0 inset-x-0 bg-black text-white p-6 pt-8 rounded-[2rem] transform translate-y-2 transition-transform group-hover:translate-y-0">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Sales</div>
                                <div className="font-mono text-4xl font-bold tracking-tighter">
                                    ₹{dailyTotal.toFixed(0)}<span className="text-lg text-gray-500">.{dailyTotal.toFixed(2).split('.')[1]}</span>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <ShoppingBag size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: List & Filters */}
                <div className="flex-1 w-full space-y-6">
                    {/* Compact Filter Toggles */}
                    <div className="flex justify-end">
                        <div className="flex bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm">
                            <button
                                onClick={() => setView('active')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'active' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setView('bin')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'bin' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                            >
                                <Trash2 size={14} />
                                Bin
                            </button>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-3">
                        {sales.map(sale => (
                            <div key={sale._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg 
                                        ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                                            sale.paymentMethod === 'Due' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {sale.paymentMethod[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">
                                            {sale.customerId ? sale.customerId.name : 'Guest Customer'}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ID: {sale._id.slice(-4)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                                    <div className="text-right">
                                        <div className="font-black text-lg">₹{sale.totalAmount.toFixed(2)}</div>
                                        <div className="text-xs text-gray-400 font-medium">{sale.products.length} items</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {view === 'active' ? (
                                            <button
                                                onClick={() => handleTrash(sale._id)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Move to Bin"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRestore(sale._id)} className="text-green-600">
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteForever(sale._id)} className="text-red-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sales.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-300 font-bold text-lg">No transactions</p>
                                <p className="text-gray-400 text-sm">It's quiet for {date === new Date().toISOString().split('T')[0] ? 'today' : date}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
