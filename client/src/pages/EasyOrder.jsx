import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { Search, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EasyOrder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: products } = useSelector(state => state.products);
    const { items: cartItems } = useSelector(state => state.cart);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [expandedId, setExpandedId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qtyInput, setQtyInput] = useState('1');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const categories = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleExpand = (product) => {
        if (expandedId === product._id) {
            setExpandedId(null);
            setSelectedProduct(null);
        } else {
            setExpandedId(product._id);
            setSelectedProduct(product);
            setQtyInput('1'); // Reset to default strict
        }
    };

    const handleAddToCart = (product, qty) => {
        const quantity = Number(qty);
        if (quantity <= 0) return;

        // Check stock limit client-side as well
        if (quantity > (product.qty || 0)) {
            toast.error(`Only ${product.qty} ${product.unit} available!`);
            return;
        }

        dispatch(addToCart({ ...product, qty: quantity }));
        toast.success(`Added ${quantity} ${product.unit || ''} of ${product.name} to order! 🛒`);
        setExpandedId(null); // Close after adding
    };

    return (
        <div className="h-full flex flex-col font-sans w-full bg-gray-50 relative">
            {/* Header Area */}
            <div className="px-4 pt-6 pb-2 bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 md:static md:shadow-none md:border-none md:bg-transparent md:pt-0">
                <div className="mb-4 md:hidden">
                    <h1 className="text-xl font-bold text-gray-900">Easy Order</h1>
                    <p className="text-sm text-gray-500">Pick your favorites</p>
                </div>

                {/* Search - Full Width Pill */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-1 focus:ring-black outline-none transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-colors border ${selectedCategory === cat
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-3">
                    {filteredProducts.map(product => {
                        const isExpanded = expandedId === product._id;
                        // Determine validation rules on the fly for rendering
                        const isDecimal = ['kg', 'l', 'ml', 'g', 'ltr'].includes(product.unit?.toLowerCase()) || /\d+\s*(kg|l|ml|g|ltr)/i.test(product.name);
                        const step = isDecimal ? "0.01" : "1";
                        // If expanded, use the controlled input state, else use 0 (or just don't render)
                        const currentInput = isExpanded ? qtyInput : '';

                        return (
                            <div key={product._id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 ${isExpanded ? 'ring-2 ring-black shadow-lg' : ''}`}>
                                {/* Main Row: Click to Expand */}
                                <div
                                    onClick={() => toggleExpand(product)}
                                    className="flex items-center p-3 gap-4 cursor-pointer active:bg-gray-50 bg-white relative z-10"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden relative">
                                        <img
                                            src={product.image && (product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image.replace(/\\/g, '/')}`)}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=IMG' }}
                                        />
                                        {/* Stock Badge - Mini */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 backdrop-blur-sm">
                                            {product.qty} {product.unit}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate">{product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">₹{product.sellingPrice}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide bg-gray-100 px-1.5 rounded">{product.unit || 'PCS'}</span>
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                                        {isExpanded ? <span className="text-xl font-bold leading-none mb-1">-</span> : <Plus size={16} />}
                                    </div>
                                </div>

                                {/* Expanded Area: Quantity Controls */}
                                {isExpanded && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                                                <span>Select Quantity</span>
                                                <span className={Number(qtyInput) > product.qty ? "text-red-500" : ""}>Max: {product.qty}</span>
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max={product.qty}
                                                step={step}
                                                value={currentInput}
                                                onChange={(e) => setQtyInput(e.target.value)}
                                                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-gray-800 transition-all mb-4"
                                            />

                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={product.qty}
                                                        step={isDecimal ? "any" : "1"}
                                                        value={currentInput}
                                                        onKeyDown={(e) => {
                                                            if (!isDecimal && e.key === '.') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={(e) => setQtyInput(e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-center text-xl font-black focus:ring-2 focus:ring-black outline-none"
                                                        autoFocus
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{product.unit}</span>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(product, qtyInput)}
                                                    disabled={!qtyInput || Number(qtyInput) <= 0 || Number(qtyInput) > product.qty}
                                                    className="flex-[2] py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
                                                >
                                                    Add to Order 🛒
                                                </button>
                                            </div>
                                            {Number(qtyInput) > product.qty && (
                                                <p className="text-center text-red-500 text-xs font-bold mt-2">
                                                    ⚠️ Limited Stock!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EasyOrder;
