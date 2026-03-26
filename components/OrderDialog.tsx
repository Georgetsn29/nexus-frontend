'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package } from 'lucide-react';
import Image from 'next/image';
import { Order } from '../context/UserContext';

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDialog({ isOpen, onClose, order }: OrderDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Package className="w-5 h-5 mr-2 text-violet-400" />
                Order Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-8 bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Order ID</p>
                  <p className="text-lg font-medium text-white">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400 mb-1">Date</p>
                  <p className="text-lg font-medium text-white">{order.date}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                        <div className="relative w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium line-clamp-1">{item.name}</p>
                          <p className="text-sm text-zinc-400 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-white font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm italic">No item details available for this order.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Status</p>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${order.status === 'Delivered' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <p className={`font-medium ${order.status === 'Delivered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400 mb-1">Total</p>
                  <p className="text-2xl font-mono text-violet-400">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
