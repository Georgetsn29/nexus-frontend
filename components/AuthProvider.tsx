'use client'; // This directive is essential

import { useUser } from '@/context/UserContext';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUser();

  // Show your Brutalist loading state while checking the session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-bold tracking-tighter text-4xl animate-pulse">
          NEXUS
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </>
  );
}