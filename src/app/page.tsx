"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingBag, Star } from 'lucide-react';
import clsx from 'clsx';

const VARIANTS = [
  { weight: '10g', price: 1499 },
  { weight: '20g', price: 2699 },
  { weight: '30g', price: 3999 },
];

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[1]); // Default to 20g
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isWholesale, setIsWholesale] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      variant: selectedVariant.weight,
      price: selectedVariant.price,
      quantity: Number(quantity) || 1,
      image: '/assets/IMG_6241.PNG',
      isWholesale: isWholesale,
    });
    alert('Added to cart!');
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <Image
            src="/assets/IMG_6242.PNG" // Background hero image
            alt="Black Gold Shilajit"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        <div className="container mx-auto px-4 z-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="text-white">Pure.</span>
              <span className="gold-gradient"> Potent.</span>
              <br />
              <span className="text-white">Natural.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-8 font-light">
              Experience the ancient power of Himalayan Shilajit.
              100% Organic, purified resin for vitality and strength.
            </p>
            <button
              onClick={() => document.getElementById('product')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
            >
              Shop Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-2xl"
            >
              <Image
                src="/assets/IMG_6239.PNG" // Main product image
                alt="Shilajit Jar"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                  <Star className="fill-current w-5 h-5" />
                </div>
                <span className="text-zinc-400">(Premium Grade A)</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">Himalayan Shilajit Resin</h2>
              <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                Our Black Gold Shilajit is sourced from high-altitude rocks in the Himalayas.
                Rich in fulvic acid and over 84 minerals, it boosts energy, supports immunity,
                and enhances cognitive function.
              </p>

              {/* Variant Selector */}
              <div className="mb-8">
                <h3 className="text-sm font-uppercase text-zinc-500 tracking-wider mb-4">SELECT SIZE</h3>
                <div className="flex gap-4">
                  {VARIANTS.map((variant) => (
                    <button
                      key={variant.weight}
                      onClick={() => setSelectedVariant(variant)}
                      className={clsx(
                        "px-6 py-3 rounded-xl border transition-all duration-300 flex flex-col items-center min-w-[100px]",
                        selectedVariant.weight === variant.weight
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      )}
                    >
                      <span className="font-bold text-lg">{variant.weight}</span>
                      <span className="text-sm">Rs. {variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Wholesale */}
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-1 border border-zinc-700">
                    <input
                      type="tel"
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          setQuantity(val === '' ? '' : parseInt(val));
                        }
                      }}
                      onBlur={() => {
                        if (quantity === '' || Number(quantity) < 1) setQuantity(1);
                      }}
                      className="w-16 h-10 bg-transparent text-center font-bold text-xl focus:outline-none text-white appearance-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl cursor-pointer hover:border-yellow-500/50 transition">
                    <input
                      type="checkbox"
                      id="wholesale"
                      checked={isWholesale}
                      onChange={(e) => setIsWholesale(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-600 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                    />
                    <label htmlFor="wholesale" className="text-sm text-zinc-300 font-medium cursor-pointer select-none">
                      Wholesale Order
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-3xl font-bold text-white">
                  Rs. {selectedVariant.price * (Number(quantity) || 1)}/-
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-12 grid grid-cols-2 gap-4">
                {['Boosts Energy', 'Supports Immunity', 'Fulvic Acid Rich', 'Pure & Natural'].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div >
          </div >
        </div >
      </section >
    </div >
  );
}
