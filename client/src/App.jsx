import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
// Import Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import EasyOrder from './pages/EasyOrder';
import Customers from './pages/Customers';
import Distributors from './pages/Distributors';
import Cart from './pages/Cart';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="order" element={<EasyOrder />} />
          <Route path="cart" element={<Cart />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="distributors" element={<Distributors />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
