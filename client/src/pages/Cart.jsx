import React, { useState, useEffect } from 'react';
import { parseMessageText } from '../utils/stringUtils';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import { Trash2, CheckCircle, Smartphone, Printer, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cart = () => {
    const { items } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Checklist State
    const [checkedItems, setCheckedItems] = useState({});

    // Checkout Modal State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [startAnimation, setStartAnimation] = useState(false);

    // Billing Details
    const [customerId, setCustomerId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [customers, setCustomers] = useState([]);

    // Store Settings
    const [storeSettings, setStoreSettings] = useState({
        storeName: 'Grocery365',
        tagline: 'Premium Grocery Store',
        footerMessage: 'Thank you for shopping with us!'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                if (data) setStoreSettings(prev => ({ ...prev, ...data }));
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };
        fetchSettings();
    }, []);

    // Initialize checklist when items change
    useEffect(() => {
        const initialMap = {};
        items.forEach(item => {
            // Default check if not already set (keep existing checks if returning from modal)
            if (checkedItems[item._id] === undefined) {
                initialMap[item._id] = false; // Default to UNCHECKED
            } else {
                initialMap[item._id] = checkedItems[item._id];
            }
        });
        setCheckedItems(initialMap);
    }, [items.length]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get('/api/customers');
                setCustomers(res.data);
            } catch (err) {
                console.error("Failed to load customers", err);
            }
        };
        fetchCustomers();
    }, []);

    const toggleCheck = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Calculate Verified Total
    const verifiedItems = items.filter(item => checkedItems[item._id]);
    const totalAmount = verifiedItems.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * item.qty), 0);

    const handleProcess = () => {
        if (verifiedItems.length === 0) {
            toast.error("Please verify at least one item!");
            return;
        }
        setStartAnimation(true);
        setTimeout(() => {
            setIsCheckoutOpen(true);
            setStartAnimation(false);
        }, 300);
    };

    const handleShareWhatsApp = () => {
        // Construct Header
        let header = storeSettings.whatsappHeader
            ? parseMessageText(storeSettings.whatsappHeader.replace('{storeName}', storeSettings.storeName))
            : `*🧾 Bill from ${storeSettings.storeName}*`;

        let text = `${header}\n\n`;

        verifiedItems.forEach(item => {
            text += `${item.name} x ${item.qty}${item.unit || ''} : ₹${(item.sellingPrice * item.qty).toFixed(2)}\n`;
        });

        text += `\n*Total: ₹${totalAmount.toFixed(2)}*`;
        text += `\nPayment: ${paymentMethod}`;

        // Construct Footer
        const footer = parseMessageText(storeSettings.whatsappFooter || storeSettings.footerMessage || 'Thank you!');
        text += `\n\n_${footer}_`;

        let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        if (customerId) {
            const cust = customers.find(c => c._id === customerId);
            if (cust && cust.phone) {
                url = `https://api.whatsapp.com/send?phone=${cust.phone}&text=${encodeURIComponent(text)}`;
            }
        }
        window.open(url, '_blank');
        handleFinalCheckout(false); // Auto-save after sharing
    };

    const generateBill = (saleData) => {
        const isThermal = storeSettings.billFormat === 'Thermal';

        // Config based on format
        const config = isThermal ? {
            format: [80, 2000], // 80mm width, long height for roll
            unit: 'mm',
            centerX: 40,
            margin: 2,
            fontSize: { title: 16, normal: 8, small: 7 }
        } : {
            format: 'a4',
            unit: 'mm',
            centerX: 105,
            margin: 14,
            fontSize: { title: 22, normal: 10, small: 9 }
        };

        const doc = new jsPDF({ unit: 'mm', format: config.format });

        // Helper to center text
        const centerText = (text, y, size = config.fontSize.normal, fStyle = 'normal') => {
            doc.setFontSize(size);
            doc.setFont("helvetica", fStyle);
            doc.text(text, config.centerX, y, { align: "center" });
        };

        let yPos = isThermal ? 10 : 20;

        // Header
        centerText(storeSettings.storeName, yPos, config.fontSize.title, 'bold');
        yPos += isThermal ? 5 : 6;
        centerText(storeSettings.tagline, yPos, config.fontSize.normal);
        yPos += 5;

        // Address & Contact
        if (storeSettings.address) {
            centerText(storeSettings.address, yPos, config.fontSize.small);
            yPos += 4;
        }

        let contactText = '';
        if (storeSettings.phone) contactText += isThermal ? `Ph: ${storeSettings.phone}` : `Phone: ${storeSettings.phone}`;
        if (!isThermal && storeSettings.email) contactText += ` | Email: ${storeSettings.email}`;

        if (contactText) {
            centerText(contactText, yPos, config.fontSize.small);
            yPos += isThermal ? 4 : 6;
        }

        // Line Divider
        doc.line(config.margin, yPos, isThermal ? 78 : 200, yPos);
        yPos += 6;

        // Info Block
        doc.setFontSize(config.fontSize.small);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, config.margin, yPos);
        if (!isThermal) doc.text(new Date().toLocaleTimeString(), config.margin + 40, yPos);

        if (isThermal && storeSettings.gstin) {
            yPos += 4;
            doc.text(`GST: ${storeSettings.gstin}`, config.margin, yPos);
        } else if (storeSettings.gstin) {
            doc.text(`GSTIN: ${storeSettings.gstin}`, 150, yPos);
        }

        yPos += isThermal ? 4 : 6;
        if (customerId) {
            const cust = customers.find(c => c._id === customerId);
            doc.text(`${cust ? cust.name : 'Guest'}`, config.margin, yPos);
        } else {
            doc.text(`Guest`, config.margin, yPos);
        }
        yPos += 4;

        // Table
        const tableColumn = ["Item", "Qty", "Price", "Total"];
        const tableRows = [];

        saleData.products.forEach(item => {
            const productData = verifiedItems.find(p => p._id === item.product);
            const unit = productData ? productData.unit : '';
            const name = productData ? productData.name : 'Unknown';
            const price = productData ? productData.sellingPrice : 0;

            // For thermal, truncate name if too long
            const displayName = isThermal && name.length > 15 ? name.substring(0, 15) + '..' : name;

            tableRows.push([
                displayName,
                `${item.qty}${isThermal ? '' : ' ' + unit}`,
                price,
                (price * item.qty).toFixed(2)
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 2,
            theme: isThermal ? 'plain' : 'grid', // Plain for thermal looks better usually
            styles: { fontSize: isThermal ? 8 : 10, cellPadding: isThermal ? 1 : 2, overflow: 'linebreak' },
            headStyles: { fillColor: isThermal ? [255, 255, 255] : [0, 0, 0], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: isThermal ? { bottom: 0.1 } : 0 },
            columnStyles: {
                0: { cellWidth: isThermal ? 25 : 'auto' }, // Item
                1: { cellWidth: isThermal ? 15 : 'auto', halign: 'center' }, // Qty
                2: { cellWidth: isThermal ? 15 : 'auto', halign: 'right' }, // Price
                3: { cellWidth: isThermal ? 20 : 'auto', halign: 'right' }  // Total
            },
            margin: { left: config.margin, right: config.margin }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + (isThermal ? 5 : 10);

        doc.setFontSize(isThermal ? 10 : 14);
        doc.setFont("helvetica", "bold");

        const rightX = isThermal ? 75 : 190;
        doc.text(`Total: Rs. ${saleData.totalAmount.toFixed(2)}`, rightX, finalY, { align: "right" });

        if (isThermal) {
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Mode: ${paymentMethod}`, rightX, finalY + 5, { align: "right" });
        } else {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Payment Mode: ${paymentMethod}`, 140, finalY + 6, { align: "right" });
        }

        // Footer Message
        const footerY = finalY + (isThermal ? 15 : 20);
        centerText(storeSettings.footerMessage, footerY, isThermal ? 8 : 9, 'italic');

        // Cut line for thermal
        if (isThermal) {
            doc.text('- - - - - - - - - - - - - - - - - -', config.centerX, footerY + 5, { align: 'center' });
        }

        // Save
        doc.save(`Invoice_${Date.now()}.pdf`);
    };

    const handleFinalCheckout = async (shouldPrint = true) => {
        try {
            const saleData = {
                products: verifiedItems.map(item => ({
                    product: item._id,
                    qty: item.qty
                })),
                totalAmount: Number(totalAmount.toFixed(2)),
                customerId: customerId || null,
                paymentMethod
            };

            await axios.post('/api/sales', saleData);

            // Generate PDF only if requested
            if (shouldPrint) {
                generateBill(saleData);
            }

            // Clean up: remove purchased items from global cart
            verifiedItems.forEach(item => dispatch(removeFromCart(item._id)));

            toast.success(shouldPrint ? 'Order Placed & Printing... 🖨️' : 'Order Saved! 💾');
            setIsCheckoutOpen(false);
            if (verifiedItems.length === items.length) {
                navigate('/order');
            }
        } catch (error) {
            console.error("Checkout failed", error);
            toast.error('Checkout failed! ' + (error.response?.data?.message || ''));
        }
    };

    if (items.length === 0) {
        return <div className="p-8 text-center text-gray-500 font-medium h-full flex flex-col items-center justify-center">
            <span className="text-4xl mb-4">🛒</span>
            Your verify list is empty.
        </div>;
    }

    return (
        <div className={`h-full flex flex-col font-sans max-w-4xl mx-auto w-full px-4 pt-6 pb-20 md:pb-6 transition-opacity duration-300 ${startAnimation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Verify Items</h1>
                    <p className="text-sm text-gray-500">Tick items as you pack/give them</p>
                </div>
                <div className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {verifiedItems.length}/{items.length} Checked
                </div>
            </div>

            {/* Verification List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide pb-24 md:pb-0">
                {items.map(item => (
                    <div
                        key={item._id}
                        onClick={() => toggleCheck(item._id)}
                        className={`relative p-4 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer border-2 ${checkedItems[item._id]
                            ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.01]'
                            : 'bg-white border-gray-100 opacity-60 grayscale-[0.5]'
                            }`}
                    >
                        {/* Checkbox Visual */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${checkedItems[item._id] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {checkedItems[item._id] && <CheckCircle size={16} className="text-white" />}
                        </div>

                        {/* Image */}
                        <div className="w-14 h-14 rounded-xl bg-white flex-shrink-0 p-1 mr-4 overflow-hidden border border-gray-100">
                            <img
                                src={item.image && (item.image.startsWith('http') ? item.image : `/${item.image.replace(/\\/g, '/')}`)}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Food' }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h3 className={`font-bold text-gray-800 leading-tight ${checkedItems[item._id] ? '' : 'line-through decoration-gray-400'}`}>{item.name}</h3>
                            <p className="text-gray-500 text-xs font-medium">{item.qty} {item.unit || (item.name.toLowerCase().includes('kg') ? 'kg' : item.name.toLowerCase().includes('l') ? 'L' : 'pcs')}</p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <span className="font-bold text-lg">₹{(Number(item.sellingPrice || 0) * item.qty).toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const isDecimal = item.qty % 1 !== 0 || ['kg', 'l', 'g', 'ml'].includes(item.unit) || item.name.match(/\d+(?:kg|l|ml)/i);
                                        const step = isDecimal ? 0.5 : 1;
                                        // Float safe math
                                        const newQty = (item.qty - step).toFixed(2);
                                        dispatch(updateQuantity({ id: item._id, qty: Number(newQty) > 0 ? Number(newQty) : 0.1 }));
                                    }}
                                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:bg-gray-100 rounded-full"
                                >−</button>
                                <button
                                    onClick={() => {
                                        const isDecimal = item.qty % 1 !== 0 || ['kg', 'l', 'g', 'ml'].includes(item.unit) || item.name.match(/\d+(?:kg|l|ml)/i);
                                        const step = isDecimal ? 0.5 : 1;
                                        const newQty = (item.qty + step).toFixed(2);
                                        dispatch(updateQuantity({ id: item._id, qty: Number(newQty) }));
                                    }}
                                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:bg-gray-100 rounded-full"
                                >+</button>
                                <button onClick={() => dispatch(removeFromCart(item._id))} className="ml-1 text-red-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Process Button for Mobile (Fixed bottom) */}
            <div className="fixed bottom-20 left-4 right-4 md:static md:mt-4">
                <button
                    onClick={handleProcess}
                    disabled={verifiedItems.length === 0}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                    <span>Proceed to Bill</span>
                    <div className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono">₹{totalAmount.toFixed(2)}</div>
                    <ArrowRight size={20} />
                </button>
            </div>

            {/* CHECKOUT MODAL */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black">Final Bill</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">INV-{Math.floor(Math.random() * 10000)}</p>
                            </div>
                            <button onClick={() => setIsCheckoutOpen(false)} className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 font-bold">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Bill Summary */}
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex flex-col gap-2">
                                {verifiedItems.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm text-yellow-900/80">
                                        <span>{item.name} <span className="text-xs opacity-70">x {item.qty} {item.unit}</span></span>
                                        <span className="font-mono font-bold">₹{(item.sellingPrice * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="h-px bg-yellow-200 my-1"></div>
                                <div className="flex justify-between font-black text-lg text-yellow-900">
                                    <span>Total Pay</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Customer Select */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-400 uppercase">Customer Type</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => { setCustomerId(''); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!customerId ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Guest / Walk-In
                                    </button>
                                    <button
                                        onClick={() => { if (customers.length > 0) setCustomerId(customers[0]._id); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${customerId ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Existing Customer
                                    </button>
                                </div>

                                {customerId && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <select
                                            className="w-full bg-gray-50 border-none p-4 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-black outline-none appearance-none"
                                            value={customerId}
                                            onChange={(e) => setCustomerId(e.target.value)}
                                        >
                                            {customers.map(c => (
                                                <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Mode</label>
                                <div className="flex gap-2">
                                    {['Cash', 'UPI', 'Card', 'Due'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setPaymentMethod(mode)}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors border-2 ${paymentMethod === mode
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-gray-100 bg-white space-y-3">
                            <button
                                onClick={handleShareWhatsApp}
                                className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-200"
                            >
                                <Smartphone size={20} />
                                Share Bill on WhatsApp
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleFinalCheckout(false)}
                                    className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                >
                                    <CheckCircle size={20} />
                                    Save Only
                                </button>
                                <button
                                    onClick={() => handleFinalCheckout(true)}
                                    className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-transform"
                                >
                                    <Printer size={20} />
                                    Print Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
