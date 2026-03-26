'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, CreditCard, Bell, Trash2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

// 1. Explicitly define the interface to include MongoDB's _id
interface PaymentMethod {
  _id?: string;
  id?: string;
  last4: string;
  expiry: string;
  brand?: string;
  isDefault?: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setting: string | null;
}

export default function SettingsModal({ isOpen, onClose, setting }: SettingsModalProps) {
  const { user, updateUser, addPaymentMethod, deletePaymentMethod, deleteAccount } = useUser();
  const { showToast } = useToast();
  const router = useRouter();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Payment States
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [cardDeletingId, setCardDeletingId] = useState<string | null>(null);

  // Danger Zone State
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    if (!isOpen) {
      setIsAddingCard(false);
      setNewCardNumber('');
      setNewCardExpiry('');
      setNewCardCvc('');
      setIsConfirmingDelete(false);
      setCardDeletingId(null);
    }
  }, [user, isOpen]);

  const handleDeleteAccount = async () => {
  const result = await deleteAccount(); // Now we catch the return
  if (result.success) {
    showToast('Account deleted successfully');
    onClose();
    router.push('/'); // Redirect to home/landing
  } else {
    showToast(result.error || 'Failed to delete account');
  }
};
  const handleConfirmDeleteCard = async (cardId: string) => {
    try {
      await deletePaymentMethod(cardId);
      showToast('Card removed successfully');
      setCardDeletingId(null);
    } catch (error) {
      showToast('Failed to remove card');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (setting === 'Account Settings') {
      const result = await updateUser(name || '', email || '');
      if (result.success) {
        showToast('Account updated successfully');
        onClose();
      } else {
        showToast(result.error || 'Update failed');
      }
    } else if (setting === 'Payment Methods') {
      if (isAddingCard) {
        try {
          await addPaymentMethod({
            last4: newCardNumber.replace(/\s/g, '').slice(-4),
            expiry: newCardExpiry,
          });
          showToast('Card added successfully');
          setIsAddingCard(false);
          setNewCardNumber('');
          setNewCardExpiry('');
          setNewCardCvc('');
        } catch (error) {
          showToast('Failed to save card');
        }
      } else {
        onClose();
      }
    } else {
      showToast(`${setting} saved successfully`);
      onClose();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // 1. Remove everything except numbers
  let value = e.target.value.replace(/\D/g, "");
  
  // 2. Limit to 4 digits total (2 for month, 2 for year)
  if (value.length > 4) value = value.slice(0, 4);

  // 3. Format as MM/YY
  if (value.length > 2) {
    value = `${value.slice(0, 2)}/${value.slice(2)}`;
  }

  setNewCardExpiry(value);
};

const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Remove everything except numbers and limit to 3 digits
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 3) {
    setNewCardCvc(value);
  }
};

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
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{setting}</h2>
              <button
                onClick={onClose}
                type="button"
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {setting === 'Account Settings' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-white/10">
                    <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
                    {!isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                        <p className="text-sm text-red-200">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(false)}
                            className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {setting === 'Payment Methods' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Saved Cards ({user?.paymentMethods?.length || 0})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                      user.paymentMethods.map((pm: PaymentMethod) => {
                        // Priority given to _id to match MongoDB
                        const currentId = String(pm._id ?? pm.id ?? '');
                        if (!currentId) return null;

                        const isConfirming = cardDeletingId === currentId;

                        return (
                          <motion.div 
                            layout
                            key={currentId} 
                            className="p-4 border border-white/10 rounded-2xl bg-zinc-900/50 flex items-center justify-between group transition-all hover:border-violet-500/30"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-violet-500/10 rounded-lg">
                                <CreditCard className="w-5 h-5 text-violet-400" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm tracking-relaxed">
                                  •••• •••• •••• {pm.last4}
                                </p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">
                                  Expires {pm.expiry}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {!isConfirming ? (
                                <button
                                  type="button"
                                  onClick={() => setCardDeletingId(currentId)}
                                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => setCardDeletingId(null)} 
                                    className="px-3 py-1 text-[10px] text-zinc-400 hover:text-white font-bold uppercase"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleConfirmDeleteCard(currentId)} 
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-lg uppercase font-bold transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
                        <p className="text-sm text-zinc-500">No payment methods saved yet.</p>
                      </div>
                    )}
                  </div>
                    
                  {!isAddingCard ? (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingCard(true)}
                      className="w-full py-4 mt-2 border border-dashed border-white/10 rounded-2xl text-zinc-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">+</span> Add a new card
                    </button>
                  ) : (
                    <div className="p-4 border border-white/10 rounded-xl bg-zinc-900/50 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Card</h3>
                        <button type="button" onClick={() => setIsAddingCard(false)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                      </div>
                      <input 
                        type="text" 
                        required
                        value={newCardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          if (val.length <= 19) setNewCardNumber(val);
                        }}
                        placeholder="0000 0000 0000 0000" 
                        inputMode="numeric"
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono text-sm" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {/* Expiry Input */}
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          inputMode="numeric"
                          value={newCardExpiry} 
                          onChange={handleExpiryChange} 
                          maxLength={5} // MM/YY is 5 characters total
                          required
                          className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500" 
                        />

                        {/* CVC Input */}
                        <input 
                          type="text" 
                          placeholder="CVC" 
                          inputMode="numeric"
                          value={newCardCvc} 
                          onChange={handleCvcChange} 
                          maxLength={3}
                          required
                          className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {setting === 'Notifications' && (
                <div className="space-y-3">
                  {['Order Updates', 'Promotions'].map((notif) => (
                    <label key={notif} className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-zinc-900 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-violet-400" />
                        <span className="text-white font-medium text-sm">{notif}</span>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-500" />
                    </label>
                  ))}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}