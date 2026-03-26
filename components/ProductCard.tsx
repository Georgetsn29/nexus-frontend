'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import ProductDialog from './ProductDialog';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  gallery?: string[];
  description?: string;
  features?: string[];
}

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useUser();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        onClick={() => setIsDialogOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group relative flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-colors cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-800/50 p-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full h-full relative"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          {/* Quick Add Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                showToast('Please sign in to add items to cart');
                router.push('/auth');
                return;
              }
              addToCart(product);
              showToast(`Added ${product.name} to cart`);
            }}
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-zinc-200"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="text-xs font-medium text-violet-400 mb-1 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="text-lg font-medium text-white mb-2">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-zinc-400 font-mono">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      <ProductDialog 
        product={product} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}
