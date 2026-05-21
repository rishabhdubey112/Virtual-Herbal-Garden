import API_URL from '../config.js';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import Home from './pages/Home';
import Identify from './pages/Identify';
import PlantDetails from './pages/PlantDetails';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import Consult from './pages/Consult';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-wrapper">
          <FloatingLeaves />
          <Navbar />
          <main className="main-content container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/identify" element={<Identify />} />
              <Route path="/plant/:name" element={<PlantDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/consult" element={<Consult />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;