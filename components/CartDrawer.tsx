'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { showToast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-zinc-950 border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Your Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-violet-400 mt-1">{item.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 bg-zinc-900 rounded-lg p-1 border border-white/5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-4 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-mono text-white">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-xl font-mono text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    if (!user) {
                      showToast('Please sign in to checkout');
                      router.push('/auth');
                      return;
                    }
                    router.push('/checkout');
                  }}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
