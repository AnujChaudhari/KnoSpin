"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
