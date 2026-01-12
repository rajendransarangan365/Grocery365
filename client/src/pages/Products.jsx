import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../store/productSlice';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Products = () => {
    const dispatch = useDispatch();
    const { items: products, status } = useSelector(state => state.products);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [distributors, setDistributors] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);

    const [viewingProduct, setViewingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', qty: '', sellingPrice: '', category: '', image: null
    });

    // Dynamic Supply Options State
    const [supplyOptions, setSupplyOptions] = useState([
        { distributor: '', costPrice: '', stock: '', mfgDate: '', expDate: '' }
    ]);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }
        const fetchDist = async () => {
            try {
                const res = await axios.get('/api/distributors');
                setDistributors(res.data);
            } catch (err) {
                console.error("Failed to load distributors", err);
            }
        };
        fetchDist();
    }, [status, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    // Supply Options Handlers
    const handleSupplyChange = (index, field, value) => {
        const newOptions = [...supplyOptions];
        newOptions[index][field] = value;
        setSupplyOptions(newOptions);
    };

    const addSupplyOption = () => {
        setSupplyOptions([...supplyOptions, { distributor: '', costPrice: '', stock: '', mfgDate: '', expDate: '' }]);
    };

    const removeSupplyOption = (index) => {
        if (supplyOptions.length > 1) {
            const newOptions = supplyOptions.filter((_, i) => i !== index);
            setSupplyOptions(newOptions);
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                qty: product.qty,
                sellingPrice: product.sellingPrice,
                category: product.category,
                image: null // Don't prefill file input
            });
            if (product.supplyOptions && product.supplyOptions.length > 0) {
                // Map options to form format (distributor object -> id)
                const formattedOptions = product.supplyOptions.map(opt => ({
                    distributor: opt.distributor?._id || opt.distributor, // Handle populated or unpopulated
                    costPrice: opt.costPrice,
                    stock: opt.stock,
                    mfgDate: opt.mfgDate ? new Date(opt.mfgDate).toISOString().split('T')[0] : '',
                    expDate: opt.expDate ? new Date(opt.expDate).toISOString().split('T')[0] : ''
                }));
                setSupplyOptions(formattedOptions);
            } else {
                setSupplyOptions([{ distributor: '', costPrice: '', stock: '', mfgDate: '', expDate: '' }]);
            }
        } else {
            setEditingProduct(null);
            setFormData({ name: '', qty: '', sellingPrice: '', category: '', image: null });
            setSupplyOptions([{ distributor: '', costPrice: '', stock: '', mfgDate: '', expDate: '' }]);
        }
        setIsModalOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await dispatch(deleteProduct(id));
            toast.success('Product deleted');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        // data.append('qty', formData.qty); // Calculated from supplyOptions
        data.append('sellingPrice', formData.sellingPrice);
        data.append('unit', formData.unit);
        if (formData.category) data.append('category', formData.category);
        if (formData.image) data.append('image', formData.image);

        // Filter out incomplete options and stringify
        const validOptions = supplyOptions.filter(opt => opt.distributor && opt.costPrice);
        data.append('supplyOptions', JSON.stringify(validOptions));

        try {
            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct._id, data }));
                toast.success('Product updated successfully');
            } else {
                await dispatch(addProduct(data));
                toast.success('Product added successfully');
            }
            setIsModalOpen(false);
            dispatch(fetchProducts());
        } catch (error) {
            toast.error('Failed to save product');
            console.error(error);
        }
    };

    return (
        <div className="px-4 py-8 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-20 md:static">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-sm text-gray-500">Manage your catalog</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* List View */}
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden">
                {products.map(product => (
                    <div
                        key={product._id}
                        onClick={() => setViewingProduct(product)}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            <img
                                src={product.image && (product.image.startsWith('http') ? product.image : `/${product.image.replace(/\\/g, '/')}`)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=IMG' }}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate text-sm">{product.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span className={product.qty < 5 ? "text-red-500 font-bold" : ""}>{product.qty} {product.unit} left</span>
                                <span>•</span>
                                <span>₹{product.sellingPrice}</span>
                                {product.supplyOptions && product.supplyOptions.length > 0 && (
                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                        {product.supplyOptions.length} Distributors
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                                className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No products found.</div>}
            </div>

            {/* View Details Modal */}
            {viewingProduct && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingProduct(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1">
                                    <img
                                        src={viewingProduct.image && (viewingProduct.image.startsWith('http') ? viewingProduct.image : `/${viewingProduct.image.replace(/\\/g, '/')}`)}
                                        alt={viewingProduct.name}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=IMG' }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{viewingProduct.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">Total Stock: {viewingProduct.qty} {viewingProduct.unit}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingProduct(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 font-bold text-gray-600">✕</button>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Stock Breakdown</h4>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Distributor</th>
                                            <th className="px-4 py-3 font-bold">Stock</th>
                                            <th className="px-4 py-3 font-bold">Cost</th>
                                            <th className="px-4 py-3 font-bold">Mfg Date</th>
                                            <th className="px-4 py-3 font-bold">Exp Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {viewingProduct.supplyOptions && viewingProduct.supplyOptions.length > 0 ? (
                                            viewingProduct.supplyOptions.map((opt, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {opt.distributor?.name || 'Unknown'}
                                                        {opt.distributor?.phone && <div className="text-xs text-gray-400 font-normal">{opt.distributor.phone}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-gray-900">{opt.stock}</td>
                                                    <td className="px-4 py-3 text-gray-500">₹{opt.costPrice}</td>
                                                    <td className="px-4 py-3 text-gray-500">{formatDate(opt.mfgDate)}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {opt.expDate ? (
                                                            <span className={new Date(opt.expDate) < new Date() ? "text-red-500 font-bold" : ""}>
                                                                {formatDate(opt.expDate)}
                                                                {new Date(opt.expDate) < new Date() && " (Expired)"}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-6 text-center text-gray-400 italic">No distributor data available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => { setViewingProduct(null); openModal(viewingProduct); }}
                                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-900 shadow-lg"
                            >
                                Edit Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                        <input type="text" name="name" placeholder="E.g. Milk Bikis" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none font-bold" required />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type</label>
                                            <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none">
                                                <option value="pcs">Pieces</option>
                                                <option value="nos">Nos</option>
                                                <option value="kg">Kg</option>
                                                <option value="l">Liters</option>
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price</label>
                                            <input type="number" name="sellingPrice" placeholder="0.00" value={formData.sellingPrice} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none font-mono font-bold" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                        <input type="text" name="category" placeholder="E.g. Biscuits" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-50 border-none p-3 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" />
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Image {editingProduct && '(Leave empty to keep existing)'}</label>
                                        <input type="file" name="image" onChange={handleFileChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" required={!editingProduct} />
                                    </div>
                                </div>

                                {/* Distributors & Cost Prices */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <label className="text-sm font-bold text-gray-900">Distributors & Stock Batches</label>
                                        <button type="button" onClick={addSupplyOption} className="text-xs font-bold text-white bg-black px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">+ Add Batch</button>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {supplyOptions.map((opt, idx) => (
                                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group animate-in slide-in-from-top-2 duration-200">
                                                {supplyOptions.length > 1 && (
                                                    <button type="button" onClick={() => removeSupplyOption(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-white">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Distributor</label>
                                                        <select
                                                            value={opt.distributor}
                                                            onChange={(e) => handleSupplyChange(idx, 'distributor', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-black"
                                                            required
                                                        >
                                                            <option value="">Select Distributor...</option>
                                                            {distributors.map(d => (
                                                                <option key={d._id} value={d._id}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cost Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={opt.costPrice || ''}
                                                            onChange={(e) => handleSupplyChange(idx, 'costPrice', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-black"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Stock Qty</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={opt.stock || ''}
                                                            onChange={(e) => handleSupplyChange(idx, 'stock', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 p-2 rounded-lg text-sm outline-none focus:border-black font-bold"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Mfg Date</label>
                                                        <input
                                                            type="date"
                                                            value={opt.mfgDate || ''}
                                                            onChange={(e) => handleSupplyChange(idx, 'mfgDate', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs outline-none focus:border-black"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Exp Date</label>
                                                        <input
                                                            type="date"
                                                            value={opt.expDate || ''}
                                                            onChange={(e) => handleSupplyChange(idx, 'expDate', e.target.value)}
                                                            className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs outline-none focus:border-black"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-900 shadow-lg active:scale-95 transition-transform">
                                    {editingProduct ? 'Update Product' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
