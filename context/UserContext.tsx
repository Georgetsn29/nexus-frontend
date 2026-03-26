'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Interfaces ---
export interface OrderItem { id: string; name: string; price: number; quantity: number; image: string; }
export interface Order { id: string; date: string; total: number; status: string; items: OrderItem[]; }

// FIX 1: Added _id to the interface so TypeScript allows MongoDB's native field
export interface PaymentMethod { 
  id?: string; 
  _id?: string; // Critical for MongoDB compatibility
  last4: string; 
  expiry: string; 
  isDefault: boolean; 
}

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  orders?: Order[];
  paymentMethods?: PaymentMethod[];
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  addOrder: (order: Order) => Promise<void>; 
  
  // UPDATE THIS LINE:
  deleteAccount: () => Promise<{ success: boolean; error?: string }>; 
  
  addPaymentMethod: (card: { last4: string; expiry: string }) => Promise<void>;
  deletePaymentMethod: (cardId: string) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // FIX 2: Ensure fetchProfile maps _id to id correctly on page reload
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
  const data = await res.json();
  setUser({
    ...data,
    id: data.id || data._id, 
    // This mapping ensures the frontend UI always has a consistent 'id' property
    paymentMethods: data.paymentMethods?.map((pm: any) => ({
      ...pm,
      id: pm._id || pm.id 
    })) || []
  });
}
    } catch (error) {
      console.error("Auth sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchProfile();
}, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isLogin: true }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          id: data.user.id || data.user._id,
          email: data.user.email,
          name: data.user.name,
          isVerified: data.user.isVerified,
          orders: data.user.orders || [],
          paymentMethods: data.user.paymentMethods?.map((pm: any) => ({
            ...pm,
            id: pm._id || pm.id
          })) || []
        });
        if (rememberMe) localStorage.setItem('nexus_logged_in', 'true');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const logout = async () => {
    await fetch('http://localhost:5000/api/v1/users/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    localStorage.removeItem('nexus_logged_in');
  };

  const updateUser = async (name: string, email: string) => {
    const res = await fetch('http://localhost:5000/api/v1/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      setUser(prev => prev ? { 
      ...prev, 
      name: data.user.name || name, 
      email: data.user.email || email 
    } : null);
    return { success: true };
  }
    return { success: false, error: data.error };
  };

  const addOrder = async (order: Order) => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/users/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }), // Wrapping it in an 'order' key to match your controller
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      // data.orders is the updated array returned from your addOrder controller
      setUser(prev => prev ? {
        ...prev,
        orders: data.orders
      } : null);
    } else {
      const errorData = await res.json();
      console.error("Failed to add order:", errorData.message);
    }
  } catch (error) {
    console.error("Network error adding order:", error);
  }
};

  const deleteAccount = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/users/delete', {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      setUser(null);
      localStorage.removeItem('nexus_logged_in');
      return { success: true }; // This is the critical missing line
    }
    
    const data = await res.json();
    return { success: false, error: data.error || 'Failed to delete' };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: 'Connection error' };
  }
};

  const addPaymentMethod = async (card: { last4: string; expiry: string }) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const newCard = {
          ...data.paymentMethod,
          id: data.paymentMethod._id || data.paymentMethod.id
        };
        setUser(prev => prev ? {
          ...prev,
          paymentMethods: [...(prev.paymentMethods || []), newCard]
        } : null);
      }
    } catch (error) {
      console.error("Failed to add payment method:", error);
      throw error;
    }
  };

  const deletePaymentMethod = async (cardId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/payments/${cardId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(prev => prev ? {
          ...prev,
          paymentMethods: prev.paymentMethods?.filter(pm => (pm.id || pm._id) !== cardId)
        } : null);
      } else {
        throw new Error('Failed to delete card');
      }
    } catch (error) {
      console.error("Delete failed:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, login, logout, updateUser, addOrder, deleteAccount, 
      addPaymentMethod, deletePaymentMethod, isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};