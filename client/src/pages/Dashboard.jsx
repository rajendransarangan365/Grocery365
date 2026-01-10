import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Package, Bell, ArrowUpRight, DollarSign, Activity, Phone } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0 });
    const [timeRange, setTimeRange] = useState('week');
    const [chartData, setChartData] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [todaySales, setTodaySales] = useState(0);

    // Fetch Today's Specific Sales
    useEffect(() => {
        const fetchToday = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await axios.get('/api/sales/history', { params: { date: today } });
                const total = res.data.reduce((sum, sale) => sum + sale.totalAmount, 0);
                setTodaySales(total);
            } catch (error) {
                console.error("Error fetching today's sales", error);
            }
        };
        fetchToday();
    }, []);


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

    const actionRequiredRef = React.useRef(null);

    const scrollToRef = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ... (keep existing helper)
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

                {/* TODAY'S DATE SLIP CARD (New) */}
                <div className="relative w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 font-sans group h-full min-h-[300px]">
                    {/* Top White Part */}
                    <div className="p-8 pb-32">
                        <div className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Live Overview</div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long' })},<br />
                            <span className="text-gray-400">{new Date().getDate()} {new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                        </h2>
                    </div>

                    {/* Bottom Black Part */}
                    <div className="absolute bottom-0 inset-x-0 bg-black text-white p-6 pt-8 rounded-[2rem] transform translate-y-2 transition-transform group-hover:translate-y-0">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Today's Sales</div>
                                <div className="font-mono text-4xl font-bold tracking-tighter">
                                    ₹{todaySales.toFixed(0)}<span className="text-lg text-gray-500">.{todaySales.toFixed(2).split('.')[1]}</span>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-2 rounded-lg">
                                <DollarSign size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Card - Dark Gradient */}
                <div className="relative overflow-hidden bg-zinc-900 text-white rounded-[2rem] p-8 shadow-2xl group min-h-[300px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                            <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                                <Activity size={20} />
                            </div>
                            <span className="font-bold text-sm tracking-widest uppercase">Total Revenue</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">{formatCurrency(stats.totalSales)}</h2>
                        <div className="flex items-center gap-1 text-green-400 font-bold text-sm bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight size={16} />
                            <span>{timeRange} performance</span>
                        </div>
                    </div>
                </div>

                {/* Profit Card & Alerts (Stacked for layout balance) */}
                <div className="space-y-6">
                    {/* Profit Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#10B981] to-[#047857] text-white rounded-[2rem] p-8 shadow-xl shadow-green-100 group">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-black/20"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 opacity-90">
                                <div className="p-2 bg-black/10 rounded-full backdrop-blur-md">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="font-bold text-sm tracking-widest uppercase">Net Profit</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-1">{formatCurrency(stats.totalProfit)}</h2>
                            <div className="text-green-50 font-bold text-xs opacity-90">
                                Solid margins! 🚀
                            </div>
                        </div>
                    </div>

                    {/* Alerts Card */}
                    <div
                        onClick={() => scrollToRef(actionRequiredRef)}
                        className="relative overflow-hidden bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-95"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <AlertTriangle size={18} />
                                    <span className="font-bold text-xs tracking-widest uppercase">Alerts</span>
                                </div>
                                {lowStock.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{lowStock.length}</span>}
                            </div>
                            <h2 className="text-3xl font-black text-gray-900">{lowStock.length}</h2>
                            <p className="text-gray-400 text-xs font-medium">Low stock items</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Alerts Feed - Moved Above Chart */}
            <div ref={actionRequiredRef}>
                {lowStock.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 px-2 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-red-500" /> Action Required
                        </h3>
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
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
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
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between group hover:bg-black hover:text-white transition-all duration-300 border border-gray-100 hover:border-black">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                                {opt.distributor?.name?.charAt(0) || 'D'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{opt.distributor?.name || 'Unknown'}</p>
                                                <div className="flex items-center gap-2 text-xs opacity-60 font-medium">
                                                    <span>Stock: {opt.stock || 0}</span>
                                                    {opt.distributor?.phone && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1">
                                                                <span>{opt.distributor.phone}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black text-lg">₹{opt.costPrice}</p>
                                            {opt.distributor?.phone && (
                                                <a
                                                    href={`tel:${opt.distributor.phone}`}
                                                    onClick={(e) => e.stopPropagation()} // Prevent card click
                                                    className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-md transition-transform active:scale-95"
                                                    title="Call Dealer"
                                                >
                                                    <Phone size={18} fill="currentColor" />
                                                </a>
                                            )}
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
