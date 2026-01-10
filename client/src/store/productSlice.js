import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    const response = await axios.get(API_URL);
    return response.data;
});

export const addProduct = createAsyncThunk('products/addProduct', async (productData) => {
    const response = await axios.post(API_URL, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
});

// Update
export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
});

// Delete
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
});

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload);
            });
    },
});

export default productSlice.reducer;
