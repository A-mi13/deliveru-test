"use client";

import { useFavorites } from "@/components/shared/FavoritesContext";
import { useCart } from "@/components/shared/CartContext";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import ProductModal from "@/components/shared/ProductModal"; // Импортируем компонент модального окна
import { Product } from "@prisma/client";
import { useRouter } from "next/navigation"; // Импортируем useRouter

const categoryColors: { [key: number]: string } = {
  1: "bg-red-500",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-yellow-500",
  5: "bg-purple-500",
};

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const { cart, addToCart, increaseCount, decreaseCount } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter(); // Инициализируем роутер

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const favoriteProducts = allProducts.filter((product) => favorites.includes(product.id));

  if (isLoading) {
    return (
      <div className="p-4 max-w-[480px] mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center text-gray-600 hover:text-black">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-4">Избранное</h1>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="p-4 max-w-[480px] mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center text-gray-600 hover:text-black">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-4">Избранное</h1>
        <p>В избранном пока нет товаров.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[430px] mx-auto">
      <button onClick={() => router.push("/")} className="flex items-center text-gray-600 hover:text-black">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-2xl font-bold mb-4">Избранное</h1>
      <div className="space-y-4">
        {favoriteProducts.map((product) => {
          const count = cart[product.id]?.count || 0;

          return (
            <div
              key={product.id}
              className={`flex justify-between items-center p-4 rounded-lg text-white ${categoryColors[product.categoryId] || "bg-gray-500"}`}
              style={{ height: "120px" }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-center gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                <div>
                  <h3 className="font-bold text-[14px]">{product.name}</h3>
                  {product.price && <p className="mt-1">{product.price}₽</p>}
                </div>
              </div>

              <div className="h-full flex flex-col items-center justify-center">
                {count > 0 ? (
                  <div className="flex flex-col items-center gap-2 h-full justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        increaseCount(product.id); // Увеличиваем количество
                      }}
                      className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="mx-2">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseCount(product.id); // Уменьшаем количество
                      }}
                      className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-[#70B9BE] text-white h-full w-10 flex items-center justify-center rounded-r-lg"
                    style={{ borderRadius: "0.5rem 0.5rem 0.5rem 0.5rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id); // Добавляем товар в корзину
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cart={cart}
          handleAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default FavoritesPage;