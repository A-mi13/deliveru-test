"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import ComboModal from "./ComboModal"; // Импортируем новый компонент ComboModal
import { Product } from "@prisma/client";
import { useCart } from "@/components/shared/CartContext"; // Контекст корзины

const categoryColors: { [key: number]: string } = {
  1: "bg-red-500",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-yellow-500",
  5: "bg-purple-500",
};

type Category = {
  id: number;
  name: string;
};

type Props = {
  className?: string;
};

interface ProductItem {
  id: number;
  size: number;
  price: number;
}

interface ProductWithItems extends Product {
  items?: ProductItem[]; // Добавляем поле для вариаций продукта
}

export const Categories: React.FC<Props> = ({ className }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithItems[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithItems | null>(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const { cart, addToCart, increaseCount, decreaseCount } = useCart();
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);

        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error("Ошибка загрузки данных");
        }

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const activeCategoryId = categories[activeIndex]?.id;
  const activeProducts = products.filter(
    (product) => product.categoryId === activeCategoryId
  );

  const getProductPrice = (product: ProductWithItems) => {
    if (product.items && product.items.length > 0) {
      const validItems = product.items.filter((item) => item.size !== null);

      if (validItems.length > 0) {
        const minPrice = Math.min(...validItems.map((item) => item.price));
        return `ОТ ${minPrice}₽`;
      }
    }
    return `${product.price}₽`;
  };

  const isComboCategory = categories[activeIndex]?.name.toLowerCase() === "комбо";

  return (
    <div className="max-w-[430px] mx-auto p-4">
      <div
        className={cn(
          "inline-flex max-w-[400px] gap-1 overflow-x-auto whitespace-nowrap",
          className
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((cat, index) => (
          <a
            key={cat.id}
            className={cn(
              "flex items-center font-bold h-11 cursor-pointer",
              index === 0 ? "px-0" : "px-2",
              activeIndex === index ? "text-primary" : "text-gray-500"
            )}
            onClick={() => setActiveIndex(index)}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {isComboCategory && (
        <button
          className="mt-4 bg-[#70B9BE] text-white w-full py-3 rounded-full"
          onClick={() => setIsComboModalOpen(true)}
        >
          Создать комбо
        </button>
      )}

      <div className="pb-24 grid grid-cols-2 gap-4 mt-4">
        {activeProducts.map((product) => {
          const productCount = cart[product.id]?.count || 0;

          return (
            <div
              key={product.id}
              className={cn(
                "flex flex-col justify-between p-2 h-[240px] rounded-lg text-white relative cursor-pointer",
                categoryColors[activeCategoryId] || "bg-gray-500"
              )}
              onClick={() => setSelectedProduct(product)} // Открываем модальное окно при клике на продукт
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-[175px] h-[120px] object-cover rounded-md"
              />
              <p className="mt-1">{getProductPrice(product)}</p>
              <h3 className="font-bold text-[14px]">{product.name}</h3>

              {productCount > 0 ? (
                <div className="flex items-center justify-center mt-auto">
                  <div className="flex items-center text-white p-1 rounded-full w-full max-w-xs justify-center bg-[#70B9BE]">
                    <button
                      className="text-white px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        decreaseCount(product.id);
                      }}
                    >
                      -
                    </button>
                    <span className="mx-2">{productCount}</span>
                    <button
                      className="text-white px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        increaseCount(product.id);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-auto bg-[#F5F5F5] text-[#70B9BE] p-1 rounded-full w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedProduct(product); // Открываем модальное окно при нажатии на "+"
                  }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cart={cart}
          handleAddToCart={addToCart}
        />
      )}

      {isComboModalOpen && (
        <ComboModal
          onClose={() => setIsComboModalOpen(false)}
          products={{
            shawarma: products.filter((p) => p.categoryId === 1),
            snacks: products.filter((p) => p.categoryId === 4),
            drinks: products.filter((p) => p.categoryId === 3),
          }}
        />
      )}
    </div>
  );
};