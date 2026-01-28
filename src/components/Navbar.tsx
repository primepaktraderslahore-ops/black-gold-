"use client";

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

import HeaderBanner from './HeaderBanner';

export default function Navbar() {
    const { totalItems } = useCart();
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
            <HeaderBanner />
            <nav className="bg-black/80 backdrop-blur-md border-b border-zinc-800 w-full">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-200 bg-clip-text text-transparent">
                        Black Gold
                    </Link>

                    <Link
                        href="/cart"
                        className="relative p-2 text-zinc-300 hover:text-yellow-400 transition-colors"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>
        </div>
    );
}
