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

    const [qtyModalOpen, setQtyModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qtyInput, setQtyInput] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const categories = ['All', ...new Set(products.map(p => p.category || 'Uncategorized'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category || 'Uncategorized') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const initiateAddToCart = (product) => {
        // ALWAYS ask for quantity with the new slider UI as requested
        setSelectedProduct(product);
        setQtyInput(1); // Default to 1
        setQtyModalOpen(true);
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
        setQtyModalOpen(false);
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

            {/* Product Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                            {/* Image Aspect Ratio Square */}
                            <div className="aspect-square bg-gray-50 relative overflow-hidden group">
                                <img
                                    src={product.image && (product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image.replace(/\\/g, '/')}`)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=IMG' }}
                                />
                                <button
                                    onClick={() => initiateAddToCart(product)}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg active:scale-95 text-black hover:bg-black hover:text-white transition-colors border border-gray-100"
                                >
                                    <Plus size={16} />
                                </button>
                                {/* Stock Badge Overlay */}
                                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {product.qty} {product.unit} left
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="p-3">
                                <div className="flex justify-between items-start mb-1 h-10">
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2 line-clamp-2">{product.name}</h3>
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wide">
                                        {product.unit || 'PCS'}
                                    </p>
                                    <span className="font-bold text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">₹{product.sellingPrice}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No items found.</p>
                    </div>
                )}
            </div>

            {/* Quantity Modal with Slider */}
            {qtyModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black mb-1">Add to Cart</h3>
                            <p className="text-gray-500 text-sm font-medium">How much <span className="text-black font-bold">{selectedProduct.name}</span>?</p>
                        </div>

                        {/* Slider Control */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                <span>0</span>
                                <span>Max: {selectedProduct.qty} {selectedProduct.unit}</span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max={selectedProduct.qty}
                                step={(['kg', 'l', 'ml', 'g', 'ltr'].includes(selectedProduct.unit?.toLowerCase()) || /\d+\s*(kg|l|ml|g|ltr)/i.test(selectedProduct.name)) ? "0.01" : "1"}
                                value={qtyInput}
                                onChange={(e) => setQtyInput(e.target.value)}
                                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-gray-800 transition-all"
                            />

                            {/* Manual Input Sync */}
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedProduct.qty}
                                        step={(['kg', 'l', 'ml', 'g', 'ltr'].includes(selectedProduct.unit?.toLowerCase()) || /\d+\s*(kg|l|ml|g|ltr)/i.test(selectedProduct.name)) ? "any" : "1"}
                                        value={qtyInput}
                                        onKeyDown={(e) => {
                                            const isDecimal = ['kg', 'l', 'ml', 'g', 'ltr'].includes(selectedProduct.unit?.toLowerCase()) || /\d+\s*(kg|l|ml|g|ltr)/i.test(selectedProduct.name);
                                            // Prevent decimal point for non-decimal units
                                            if (!isDecimal && e.key === '.') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            // Let's allow typing but clamp if needed on submit
                                            setQtyInput(e.target.value);
                                        }}
                                        className="w-32 bg-gray-100 border-none rounded-2xl py-3 text-center text-3xl font-black focus:ring-2 focus:ring-black outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{selectedProduct.unit}</span>
                                </div>
                            </div>

                            {Number(qtyInput) > selectedProduct.qty && (
                                <p className="text-center text-red-500 text-xs font-bold mt-2 animate-bounce">
                                    ⚠️ Max available is {selectedProduct.qty} {selectedProduct.unit}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setQtyModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAddToCart(selectedProduct, qtyInput)}
                                disabled={!qtyInput || Number(qtyInput) <= 0 || Number(qtyInput) > selectedProduct.qty}
                                className="flex-1 py-4 bg-black text-white font-bold rounded-xl shadow-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                            >
                                Add +
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EasyOrder;
