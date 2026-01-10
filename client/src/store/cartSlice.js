import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
    },
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(item => item._id === action.payload._id);
            const quantityToAdd = action.payload.qty !== undefined ? Number(action.payload.qty) : 1;

            if (existingItem) {
                // Ensure we work with numbers to avoid string concatenation issues
                existingItem.qty = Number(existingItem.qty) + quantityToAdd;
                // Optional: Limit decimals to avoid floating point errors (e.g. 0.1 + 0.2)
                // existingItem.qty = Math.round(existingItem.qty * 100) / 100;
            } else {
                state.items.push({ ...action.payload, qty: quantityToAdd });
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
        },
        updateQuantity: (state, action) => {
            const { id, qty } = action.payload;
            const item = state.items.find(item => item._id === id);
            if (item) {
                item.qty = qty;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
