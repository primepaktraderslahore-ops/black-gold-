import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for now, can switch
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalPopup from "@/components/GlobalPopup";
import HeaderBanner from "@/components/HeaderBanner"; // Added import
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Black Gold | Himalayan Shilajit",
  description: "Premium Himalayan Shilajit in Lahore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <GlobalPopup />
          <GlobalPopup />
          {/* HeaderBanner moved to Navbar */}
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
