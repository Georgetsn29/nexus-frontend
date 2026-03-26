'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, CreditCard, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from './ProductCard';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';

interface ProductDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDialog({ product, isOpen, onClose }: ProductDialogProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const { user } = useUser();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(product.image);

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedImage(product.image);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product.image]);

  const handleAddToCart = () => {
    if (!user) {
      showToast('Please sign in to add items to cart');
      onClose();
      router.push('/auth');
      return;
    }
    addToCart(product);
    showToast(`Added ${product.name} to cart`);
    onClose();
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Please sign in to buy items');
      onClose();
      router.push('/auth');
      return;
    }
    // Save item to session storage for direct checkout
    sessionStorage.setItem('buyNowItem', JSON.stringify({ ...product, quantity: 1 }));
    onClose();
    router.push('/checkout?buyNow=true');
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
            className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="relative w-full md:w-1/2 bg-zinc-900/50 p-8 min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />
              <div className="relative w-full h-full max-w-sm aspect-square mb-6">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-2xl transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Gallery Thumbnails */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="flex gap-3 z-10 mt-auto">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-violet-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="mb-2 text-sm font-medium text-violet-400 uppercase tracking-wider">
                {product.category}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{product.name}</h2>
              <div className="text-2xl font-mono text-zinc-300 mb-6">${product.price.toFixed(2)}</div>
              
              <div className="prose prose-invert mb-8">
                <p className="text-zinc-400 leading-relaxed">
                  {product.description || 'Experience premium quality and exceptional design with this meticulously crafted product, built to elevate your everyday life.'}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-zinc-400">
                        <Check className="w-5 h-5 text-violet-500 mr-3 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors flex items-center justify-center group"
                >
                  <ShoppingBag className="w-5 h-5 mr-2 text-zinc-400 group-hover:text-white transition-colors" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
