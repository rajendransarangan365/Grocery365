import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('cartItems');
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
};

const saveState = (items) => {
    try {
        const serializedState = JSON.stringify(items);
        localStorage.setItem('cartItems', serializedState);
    } catch {
        // ignore write errors
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadState(),
    },
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(item => item._id === action.payload._id);
            const quantityToAdd = action.payload.qty !== undefined ? Number(action.payload.qty) : 1;

            if (existingItem) {
                existingItem.qty = Number(existingItem.qty) + quantityToAdd;
            } else {
                state.items.push({ ...action.payload, qty: quantityToAdd });
            }
            saveState(state.items);
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
            saveState(state.items);
        },
        updateQuantity: (state, action) => {
            const { id, qty } = action.payload;
            const item = state.items.find(item => item._id === id);
            if (item) {
                item.qty = qty;
            }
            saveState(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            saveState(state.items);
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
