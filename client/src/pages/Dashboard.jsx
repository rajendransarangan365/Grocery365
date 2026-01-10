import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Package, Bell, ArrowUpRight, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0 });
    const [timeRange, setTimeRange] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesRes = await axios.get(`/api/sales/analytics?range=${timeRange}`);
                // Process Stats for Card
                setStats({
                    totalSales: salesRes.data.totalSalesAmount || 0,
                    totalProfit: salesRes.data.totalProfit || 0
                });

                // Set Chart Data
                if (salesRes.data.chartData) {
                    setChartData(salesRes.data.chartData);
                }

                // Process weekly stats
                if (salesRes.data.weeklyStats) {
                    const raw = salesRes.data.weeklyStats;
                    const maxVal = Math.max(...raw.map(d => d.amount), 1);
                    const normalized = raw.map(d => ({
                        day: d.day,
                        height: (d.amount / maxVal) * 100,
                        amount: d.amount
                    }));
                    setWeeklyData(normalized);
                }

                const productsRes = await axios.get('/api/products');
                const low = productsRes.data.filter(p => p.qty < 5);
                setLowStock(low);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, [timeRange]);

    // Helper for currency formatting
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="space-y-8 px-4 py-8 md:px-0 max-w-6xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 font-medium">Overview of your store's performance</p>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Sales Card - Dark Gradient */}
                <div className="relative overflow-hidden bg-black text-white rounded-[2rem] p-8 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                            <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                                <DollarSign size={20} />
                            </div>
                            <span className="font-bold text-sm tracking-widest uppercase">Total Sales</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">{formatCurrency(stats.totalSales)}</h2>
                        <div className="flex items-center gap-1 text-green-400 font-bold text-sm bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight size={16} />
                            <span>+12.5% this week</span>
                        </div>
                    </div>
                </div>

                {/* Profit Card - Vibrant Gradient - FIXED "BLEEDING" */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#10B981] to-[#047857] text-white rounded-[2rem] p-8 shadow-2xl shadow-green-200 group">
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-black/20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-90">
                            <div className="p-2 bg-black/10 rounded-full backdrop-blur-md">
                                <TrendingUp size={20} />
                            </div>
                            <span className="font-bold text-sm tracking-widest uppercase">Net Profit</span>
                        </div>
                        {/* THE FIX: using formatCurrency handles rounding automatically */}
                        <h2 className="text-4xl font-black tracking-tight mb-2">{formatCurrency(stats.totalProfit)}</h2>
                        <div className="text-green-50 font-bold text-sm opacity-90">
                            Solid margins! 🚀
                        </div>
                    </div>
                </div>

                {/* Alerts Card */}
                <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[2rem] p-8 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <div className="p-2 bg-red-50 text-red-500 rounded-full">
                                    <AlertTriangle size={20} />
                                </div>
                                <span className="font-bold text-sm tracking-widest uppercase text-gray-500">Alerts</span>
                            </div>
                            {lowStock.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{lowStock.length} Low</span>}
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-1">{lowStock.length}</h2>
                        <p className="text-gray-400 text-sm font-medium">Products need attention</p>
                    </div>
                    {lowStock.length === 0 && (
                        <div className="text-sm font-bold text-green-500 flex items-center gap-1 mt-4">
                            <Package size={16} /> All stocked up!
                        </div>
                    )}
                </div>
            </div>



            {/* Chart Section */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-black" size={20} />
                            Store Performance
                        </h3>
                        <p className="text-gray-500 text-sm">Track your growth over time</p>
                    </div>

                    {/* Time Range Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        {['week', 'month', 'year'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${timeRange === range
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 w-full -ml-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const sales = payload[0].value;
                                            const profit = payload[1].value;
                                            return (
                                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">{label}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-black"></span>
                                                            Sales: {formatCurrency(sales)}
                                                        </p>
                                                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                            Profit: {formatCurrency(profit)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#000"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 text-sm font-medium">
                            No data available for this period
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Alerts Feed */}
            {lowStock.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Action Required</h3>
                    <div className="grid gap-3">
                        {lowStock.map(p => (
                            <div key={p._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-50 p-1">
                                        <img
                                            src={p.image && (p.image.startsWith('http') ? p.image : `/${p.image.replace(/\\/g, '/')}`)}
                                            alt={p.name}
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=IMG' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{p.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-md">
                                                Only {p.qty} {p.unit} left
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(p)}
                                    className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-95 transition-all"
                                >
                                    Refill
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Restock Modal (Kept same functionality, just styled) */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Restock Options</h3>
                                <p className="text-sm text-gray-500 font-medium">For {selectedProduct.name}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 font-bold text-gray-600">✕</button>
                        </div>

                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                            {selectedProduct.supplyOptions && selectedProduct.supplyOptions.length > 0 ? (
                                selectedProduct.supplyOptions.map((opt, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between group hover:bg-black hover:text-white transition-all duration-300 cursor-pointer border border-gray-100 hover:border-black">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                                {opt.distributor?.name?.charAt(0) || 'D'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{opt.distributor?.name || 'Unknown'}</p>
                                                <p className="text-xs opacity-60 font-medium">Stock: {opt.stock || 0}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-lg">₹{opt.costPrice}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                    <p>No distributors linked.</p>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setSelectedProduct(null)} className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-colors mt-6 shadow-xl">
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
