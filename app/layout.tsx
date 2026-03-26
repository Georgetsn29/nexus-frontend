import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '../context/UserContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Nexus | E-Commerce',
  description: 'A minimalist, high-performance e-commerce web application.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans bg-black text-white antialiased">
        <ToastProvider>
          <UserProvider>
            <CartProvider>
              {/* This wrapper handles the loading state on the client side */}
              <AuthProvider>
                {children}
              </AuthProvider>
            </CartProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}