'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/components/ProductCard';
import { useUser } from '@/context/UserContext';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cart when user changes
  useEffect(() => {
    if (isMounted) {
      if (user?.id) {
        let storedCart = localStorage.getItem(`cart_${user.id}`);
        
        // Migrate old generic cart if it exists
        if (!storedCart) {
          const oldCart = localStorage.getItem('cart');
          if (oldCart) {
            storedCart = oldCart;
            localStorage.removeItem('cart');
            localStorage.setItem(`cart_${user.id}`, oldCart);
          }
        }

        if (storedCart) {
          try {
            setItems(JSON.parse(storedCart));
          } catch (e) {
            console.error('Failed to parse cart', e);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [user?.id, isMounted]);

  // Save cart when items change
  useEffect(() => {
    if (isMounted && user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    }
  }, [items, user?.id, isMounted]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        clearCart,
      }}
    >
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
