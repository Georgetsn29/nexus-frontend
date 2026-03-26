'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import Image from 'next/image';

function CheckoutContent() {
  const { items: cartItems, cartTotal: globalCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { user, addOrder, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  
  const [isLoading, setIsLoading] = useState(false);
  const [useSavedPayment, setUseSavedPayment] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (!isUserLoading && !user) {
      showToast('Please sign in to checkout');
      router.push('/auth');
    }
  }, [user, isUserLoading, router, showToast]);

  // Set default payment method
  useEffect(() => {
    if (user?.paymentMethods && user.paymentMethods.length > 0) {
      const defaultMethod = user.paymentMethods.find(m => m.isDefault) || user.paymentMethods[0];
      // Use .id here because UserContext now maps _id -> id
      setSelectedPaymentId(defaultMethod.id || defaultMethod._id || '');
      setUseSavedPayment(true);
    } else {
      setUseSavedPayment(false);
    }
  }, [user]);

  // Prepare Items
  useEffect(() => {
    if (isBuyNow) {
      const storedItem = sessionStorage.getItem('buyNowItem');
      if (storedItem) {
        try {
          const item = JSON.parse(storedItem);
          setCheckoutItems([item]);
          setCheckoutTotal(item.price * item.quantity);
          setIsReady(true);
        } catch (e) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } else {
      setCheckoutItems(cartItems);
      setCheckoutTotal(globalCartTotal);
      setIsReady(true);
      if (cartItems.length === 0 && !isUserLoading) {
        router.push('/');
      }
    }
  }, [isBuyNow, cartItems, globalCartTotal, router, isUserLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const newOrder = {
        id: `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: checkoutTotal,
        status: 'Processing',
        items: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      await addOrder(newOrder);
      
      if (isBuyNow) sessionStorage.removeItem('buyNowItem');
      clearCart();
      
      showToast('Order placed successfully!');
      router.push('/dashboard');
    } catch (err) {
      showToast('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !user || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Checkout</h1>
        <p className="text-zinc-400">Complete your order securely.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Address</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">City</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Postal Code</label>
                  <input required type="text" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-violet-400" /> Payment Method
              </h2>
              
              {user.paymentMethods && user.paymentMethods.length > 0 && (
                <div className="mb-6 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" checked={useSavedPayment} onChange={() => setUseSavedPayment(true)} className="w-4 h-4 accent-violet-500" />
                    <span className="text-white font-medium text-sm">Use saved card</span>
                  </label>
                  
                  {useSavedPayment && (
                    <div className="pl-7 space-y-3">
                      {user.paymentMethods.map(pm => (
                        <label key={pm.id || pm._id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentId === (pm.id || pm._id) ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-black/50'}`}>
                          <div className="flex items-center space-x-3">
                            <input type="radio" checked={selectedPaymentId === (pm.id || pm._id)} onChange={() => setSelectedPaymentId(pm.id || pm._id || '')} className="w-4 h-4 accent-violet-500" />
                            <div className="text-sm">
                              <p className="text-white font-medium">•••• {pm.last4}</p>
                              <p className="text-zinc-500">Exp: {pm.expiry}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center space-x-3 cursor-pointer mt-4">
                    <input type="radio" checked={!useSavedPayment} onChange={() => setUseSavedPayment(false)} className="w-4 h-4 accent-violet-500" />
                    <span className="text-white font-medium text-sm">Enter new card</span>
                  </label>
                </div>
              )}

              {!useSavedPayment && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <input required type="text" placeholder="Card Number" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="text" placeholder="MM/YY" className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono" />
                    <input required type="text" placeholder="CVC" className="px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white font-mono" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-zinc-800/50 rounded-xl border border-white/5">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{item.name}</h3>
                    <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-mono text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between text-white text-lg font-medium">
                <span>Total</span>
                <span className="text-violet-400">${checkoutTotal.toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" form="checkout-form" disabled={isLoading} className="w-full mt-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5 mr-2" /> Pay Now</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}