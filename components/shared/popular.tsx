"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductModal from "./ProductModal"; // Импортируем модальное окно продукта
import { Product } from "@prisma/client";
import { useCart } from "@/components/shared/CartContext"; // Контекст корзины

interface Props {
  className?: string;
}

export const Popular: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch("/api/products/popular");
        if (!response.ok) {
          throw new Error("Ошибка загрузки данных");
        }
        const data = await response.json();
        setPopularProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPopularProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className={cn("px-[19px] mx-auto max-w-[430px]", className)}>
      <h1 className={cn("text-black mb-4", popularProducts.length === 0 && "hidden")}>
        Популярные блюда
      </h1>

      <div className="overflow-hidden">
        <div
          className="flex gap-3 overflow-x-auto hide-scroll-bar"
          style={{ scrollbarWidth: "none" }} // Для Firefox
        >
          {popularProducts.map((product) => (
            <div
              key={product.id}
              className="p-2 rounded-[16px] w-[190px] h-[95px] flex-shrink-0 cursor-pointer flex items-center bg-[rgb(220,234,243)]"
              onClick={() => handleProductClick(product)}
            >
              <img
                className="w-[65px] h-[65px] rounded-full"
                src={product.imageUrl}
                alt={product.name}
              />
              <div className="ml-4">
                <h3 className="text-[12px] font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.price}₽</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            cart={cart}
            handleAddToCart={addToCart}
          />
        </div>
      )}

    </div>
  );
};