"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingBag, Star } from 'lucide-react';
import clsx from 'clsx';
import AdsSection from '@/components/AdsSection';

// Product Interfaces aligned with new Schema
interface ProductVariant {
  variant: string;
  price: number;
  prevPrice?: number;
  image?: string;
  isWholesale?: boolean;
}

interface Product {
  _id: string;
  title: string;
  name?: string; // Fallback
  variants: ProductVariant[];
  banner?: string;
  description?: string;
  benefits?: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selections, setSelections] = useState<Record<string, { variant: ProductVariant, quantity: number | string, isWholesale: boolean }>>({});

  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [heroContent, setHeroContent] = useState({
    title1: 'Pure.',
    title2: 'Potent.',
    title3: 'Natural.',
    subtitle: 'Experience the ancient power of Himalayan Shilajit. 100% Organic, purified resin for vitality and strength.'
  });
  const [whatsappNumber, setWhatsappNumber] = useState('923264361473'); // Default fallback

  useEffect(() => {
    const fetchToLoad = async () => {
      try {
        const [prodRes, contentRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/content')
        ]);

        const data = await prodRes.json();
        const contentData = await contentRes.json();

        if (contentData.success && contentData.data) {
          const c = contentData.data;
          setHeroContent(prev => ({
            ...prev,
            ...c.hero // Assuming stored under key 'hero'
          }));
          if (c.whatsappNumber) setWhatsappNumber(c.whatsappNumber);
        }

        if (data.success && data.data && data.data.length > 0) {
          setProducts(data.data);
          // Initialize selections
          const initialSelections: any = {};
          data.data.forEach((p: Product) => {
            if (p.variants.length > 0) {
              initialSelections[p._id] = {
                variant: p.variants[0], // Default to 1st
                quantity: 1,
                isWholesale: false
              };
            }
          });
          setSelections(initialSelections);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchToLoad();
  }, []);

  const updateSelection = (productId: string, field: string, value: any) => {
    setSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleAddToCart = (product: Product) => {
    const sel = selections[product._id];
    if (!sel) return;

    addItem({
      variant: `${product.title || product.name} - ${sel.variant.variant}`,
      price: sel.variant.price,
      quantity: Number(sel.quantity) || 1,
      image: sel.variant.image || '/placeholder.png', // Use variant image
      isWholesale: sel.isWholesale,
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
              <span className="text-white">{heroContent.title1}</span>
              <span className="gold-gradient"> {heroContent.title2}</span>
              <br />
              <span className="text-white">{heroContent.title3}</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-8 font-light">
              {heroContent.subtitle}
            </p>
            <button
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
            >
              Shop Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ads Section */}
      <AdsSection />

      {/* Products Section */}
      <div id="products" className="bg-zinc-900 py-12">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading Products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">No products available.</div>
        ) : (
          products.map((product, pIdx) => {
            const sel = selections[product._id];
            if (!sel) return null;

            return (
              <section key={product._id} className={clsx("py-12 border-b border-zinc-800", pIdx % 2 === 0 ? "bg-zinc-900" : "bg-black/20")}>
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Image Gallery */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-2xl"
                    >
                      {/* Using the selected variant's image if available, else placeholder */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sel.variant.image || '/placeholder.png'}
                        alt={product.title || product.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                      {product.banner && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-sm shadow-lg z-10 tracking-widest uppercase">
                          {product.banner}
                        </div>
                      )}
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

                      <h2 className="text-4xl md:text-5xl font-bold mb-4">{product.title || product.name}</h2>
                      <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                        {product.description || "Our Black Gold Shilajit is sourced from high-altitude rocks in the Himalayas. Rich in fulvic acid and over 84 minerals, it boosts energy, supports immunity, and enhances cognitive function."}
                      </p>

                      {/* Variant Selector */}
                      <div className="mb-8">
                        <h3 className="text-sm font-uppercase text-zinc-500 tracking-wider mb-4">SELECT SIZE</h3>
                        <div className="flex gap-4 flex-wrap">
                          {product.variants.map((variant, vIdx) => (
                            <button
                              key={`${variant.variant}-${vIdx}`}
                              onClick={() => updateSelection(product._id, 'variant', variant)}
                              className={clsx(
                                "px-6 py-3 rounded-xl border transition-all duration-300 flex flex-col items-center min-w-[100px]",
                                sel.variant.variant === variant.variant
                                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                              )}
                            >
                              <span className="font-bold text-lg">{variant.variant}</span>
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
                              value={sel.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  updateSelection(product._id, 'quantity', val === '' ? '' : parseInt(val));
                                }
                              }}
                              onBlur={() => {
                                if (sel.quantity === '' || Number(sel.quantity) < 1) updateSelection(product._id, 'quantity', 1);
                              }}
                              className="w-16 h-10 bg-transparent text-center font-bold text-xl focus:outline-none text-white appearance-none"
                            />
                          </div>

                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in wholesale pricing for ${product.title || product.name || 'Black Gold Shilajit'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-green-600/20 text-green-500 border border-green-600/30 rounded-xl cursor-pointer hover:bg-green-600/30 transition text-sm font-bold"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            Wholesale Inquiry
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          {sel.variant.prevPrice && (
                            <span className="text-zinc-500 line-through text-lg">Rs. {sel.variant.prevPrice}</span>
                          )}
                          <div className="text-3xl font-bold text-white">
                            Rs. {sel.variant.price * (Number(sel.quantity) || 1)}/-
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Add to Cart
                        </button>
                      </div>

                      {/* Benefits */}
                      <div className="mt-12 grid grid-cols-2 gap-4">
                        {(product.benefits && product.benefits.length > 0 ? product.benefits : ['Boosts Energy', 'Supports Immunity', 'Fulvic Acid Rich', 'Pure & Natural']).map((benefit) => (
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
            );
          })
        )}
      </div >

    </div >
  );
}
