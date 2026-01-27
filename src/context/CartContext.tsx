"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    variant: string;
    price: number;
    quantity: number;
    image: string;
    isWholesale?: boolean; // Add wholesale flag
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void; // Accept specific quantity
    removeItem: (variant: string) => void;
    clearCart: () => void;
    total: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity: number }) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.variant === newItem.variant && i.isWholesale === newItem.isWholesale);
            if (existing) {
                return prev.map((i) =>
                    (i.variant === newItem.variant && i.isWholesale === newItem.isWholesale)
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            }
            return [...prev, newItem];
        });
    };

    const removeItem = (variant: string) => {
        setItems((prev) => prev.filter((i) => i.variant !== variant));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
