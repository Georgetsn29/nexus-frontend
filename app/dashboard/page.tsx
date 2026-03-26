'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useUser, Order } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from 'next/navigation';
import { Package, Settings, CreditCard, Bell, ChevronRight } from 'lucide-react';
import SettingsModal from '../../components/SettingsModal';
import OrderDialog from '../../components/OrderDialog';

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allOrders = user.orders || [];
  const displayedOrders = showAllOrders ? allOrders : allOrders.slice(0, 3);

  const settingsLinks = [
    { icon: <Settings className="w-5 h-5" />, label: 'Account Settings', desc: 'Manage your personal information' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Payment Methods', desc: 'Update your billing details' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', desc: 'Configure your email preferences' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-zinc-400">Manage your orders and account settings.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2 text-violet-400" />
              {showAllOrders ? 'All Orders' : 'Recent Orders'}
            </h2>
            {allOrders.length > 3 && (
              <button 
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                {showAllOrders ? 'Show less' : 'View all'}
              </button>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            {displayedOrders.length > 0 ? (
              <div className="divide-y divide-white/5">
                {displayedOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="p-6 flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="text-white font-medium mb-1 group-hover:text-violet-300 transition-colors">{order.id}</p>
                      <p className="text-sm text-zinc-400">{order.date} • {order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-white font-mono mb-1">${order.total.toFixed(2)}</p>
                        <p className={`text-sm ${order.status === 'Delivered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {order.status}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No orders found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {settingsLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSetting(link.label)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{link.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <SettingsModal 
        isOpen={!!activeSetting} 
        onClose={() => setActiveSetting(null)} 
        setting={activeSetting} 
      />

      <OrderDialog
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
