'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ProductCard, { Product } from '../components/ProductCard';


export default function ShopPage() {

  const [PRODUCTS, setTeams] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ teamRes ] = await Promise.all([
          fetch("http://localhost:5000/api/v1/product") 
        ]);
  
        if (teamRes.ok) setTeams(await teamRes.json());
      } catch (error) {
        console.error("Connection Refused!", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {PRODUCTS.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
