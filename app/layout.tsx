"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "../components/shared/header";
import { Banner } from "../components/shared/banner";
import { Popular } from "../components/shared/popular";
import { Footer } from "../components/shared/footer";
import { Categories } from "../components/shared/categories";
import { CartProvider } from "@/components/shared/CartContext";
import { usePathname } from "next/navigation";
import { FavoritesProvider } from "@/components/shared/FavoritesContext";

const inter = Inter({
  subsets: ["cyrillic"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories"); // Заменить на ваш API-роут
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <FavoritesProvider>
            {isHomePage && (
              <>
                <Header />
                <Banner />
                <Popular />
              </>
            )}
            <main>{children}</main>
            {isHomePage && <Footer />}
            {isHomePage && <Categories />}
          </FavoritesProvider>
        </CartProvider>

        {/* Затемненный экран с лоадером */}
        {loading && (
          <div className="fixed inset-0 bg-black max-w-[430px] mx-auto bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-12 h-12 border-4 max-w-[430px] mx-auto border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </body>
    </html>
  );
}