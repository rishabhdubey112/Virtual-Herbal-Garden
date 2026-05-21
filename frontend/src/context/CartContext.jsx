import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('herbal_cart')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('herbal_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (plant) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === plant.id);
            if (existing) {
                return prev.map(i => i.id === plant.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...plant, qty: 1 }];
        });
    };

    const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

    const updateQty = (id, qty) => {
        if (qty < 1) return removeFromCart(id);
        setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const clearCart = () => setCartItems([]);

    const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};
