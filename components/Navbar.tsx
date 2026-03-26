'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useUser();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Shop', path: '/' },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-white font-bold text-xl tracking-tighter">NEXUS</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.path
                        ? 'text-white bg-white/10'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-zinc-400 hover:text-white transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-violet-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-zinc-400">Hi, {user.name}</span>
                  <button
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.path
                    ? 'text-white bg-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-white/5"
            >
              Cart ({cartCount})
            </button>
            {!user && (
              <Link
                href="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Logout
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
