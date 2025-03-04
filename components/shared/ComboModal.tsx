"use client";
import React, { useState } from "react";
import { Product } from "@prisma/client";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import { calculateItemTotalPrice } from "./priceCalculator";

interface ComboModalProps {
  onClose: () => void;
  products: {
    shawarma: Product[];
    snacks: Product[];
    drinks: Product[];
  };
}

const ComboModal: React.FC<ComboModalProps> = ({ onClose, products }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedShawarma, setSelectedShawarma] = useState<Product | null>(null);
  const [selectedSnacks, setSelectedSnacks] = useState<Product[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<Product[]>([]);
  const [showAllShawarma, setShowAllShawarma] = useState(false);
  const [showAllSnacks, setShowAllSnacks] = useState(false);
  const [showAllDrinks, setShowAllDrinks] = useState(false);

  const handleAddToCart = () => {
    const comboItems = [selectedShawarma, ...selectedSnacks, ...selectedDrinks].filter((item): item is Product => Boolean(item));
    comboItems.forEach((item) => addToCart(item.id));
    router.push("/cart");
  };

  const totalPrice = calculateItemTotalPrice({
    product: selectedShawarma ?? undefined, // заменяем null на undefined
    ingredients: [...selectedSnacks, ...selectedDrinks],
    count: 1,
  });

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white max-w-[430px] w-full h-[70%] rounded-t-lg p-4 relative overflow-y-auto no-scrollbar">
        <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Создать комбо</h2>

        {/* Шаверма */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Шаверма</h3>
          <div className="grid grid-cols-3 gap-2">
            {(showAllShawarma ? products.shawarma : products.shawarma.slice(0, 3)).map((shawarma) => (
              <div
                key={shawarma.id}
                className={`flex flex-col items-center p-2 border ${
                  selectedShawarma?.id === shawarma.id ? "border-[#70B9BE]" : "border-gray-200"
                } rounded-lg`}
                onClick={() => setSelectedShawarma(shawarma)}
              >
                <img src={shawarma.imageUrl} alt={shawarma.name} className="w-16 h-16 object-cover rounded-full" />
                <p className="text-sm mt-1 text-center">{shawarma.name}</p>
              </div>
            ))}
          </div>
          {products.shawarma.length > 3 && (
            <button
              className="text-[#70B9BE] mt-2"
              onClick={() => setShowAllShawarma(!showAllShawarma)}
            >
              {showAllShawarma ? "Скрыть" : "Показать все"}
            </button>
          )}
        </div>

        {/* Закуски */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Закуски</h3>
          <div className="grid grid-cols-3 gap-2">
            {(showAllSnacks ? products.snacks : products.snacks.slice(0, 3)).map((snack) => (
              <div
                key={snack.id}
                className={`flex flex-col items-center p-2 border ${
                  selectedSnacks.some((s) => s.id === snack.id) ? "border-[#70B9BE]" : "border-gray-200"
                } rounded-lg`}
                onClick={() => {
                  setSelectedSnacks((prev) =>
                    prev.some((s) => s.id === snack.id)
                      ? prev.filter((s) => s.id !== snack.id)
                      : [...prev, snack]
                  );
                }}
              >
                <img src={snack.imageUrl} alt={snack.name} className="w-16 h-16 object-cover rounded-full" />
                <p className="text-sm mt-1 text-center">{snack.name}</p>
              </div>
            ))}
          </div>
          {products.snacks.length > 3 && (
            <button
              className="text-[#70B9BE] mt-2"
              onClick={() => setShowAllSnacks(!showAllSnacks)}
            >
              {showAllSnacks ? "Скрыть" : "Показать все"}
            </button>
          )}
        </div>

        {/* Напитки */}
        <div className="mb-20">
          <h3 className="text-lg font-semibold mb-2">Напитки</h3>
          <div className="grid grid-cols-3 gap-2">
            {(showAllDrinks ? products.drinks : products.drinks.slice(0, 3)).map((drink) => (
              <div
                key={drink.id}
                className={`flex flex-col items-center p-2 border ${
                  selectedDrinks.some((d) => d.id === drink.id) ? "border-[#70B9BE]" : "border-gray-200"
                } rounded-lg`}
                onClick={() => {
                  setSelectedDrinks((prev) =>
                    prev.some((d) => d.id === drink.id)
                      ? prev.filter((d) => d.id !== drink.id)
                      : [...prev, drink]
                  );
                }}
              >
                <img src={drink.imageUrl} alt={drink.name} className="w-16 h-16 object-cover rounded-full" />
                <p className="text-sm mt-1 text-center">{drink.name}</p>
              </div>
            ))}
          </div>
          {products.drinks.length > 3 && (
            <button
              className="text-[#70B9BE] mt-2"
              onClick={() => setShowAllDrinks(!showAllDrinks)}
            >
              {showAllDrinks ? "Скрыть" : "Показать все"}
            </button>
          )}
        </div>

        {/* Кнопка добавления в корзину */}
        <div className="fixed max-w-[430px] mx-auto bottom-0 left-0 right-0 bg-white p-4">
          <button
            className="bg-[#70B9BE] text-white w-full py-3 rounded-full"
            onClick={handleAddToCart}
          >
            Добавить в корзину за {totalPrice}₽
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboModal;