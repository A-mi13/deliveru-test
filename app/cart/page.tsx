"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "@/components/shared/CartContext";
import ProductModal from "@/components/shared/ProductModal";
import { useRouter } from "next/navigation";


const CartPage: React.FC = () => {
  const { cart, isLoading, increaseCount, decreaseCount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [deliveryPrice] = useState(50);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const router = useRouter();

  if (isLoading) return <div>Загрузка корзины...</div>;

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.count, 0);

  const totalPrice = Object.values(cart).reduce((sum, item) => {
    const ingredientTotal = item.ingredients?.reduce((acc, ing) => acc + ing.price, 0) || 0;
    return sum + item.count * (item.product.price + ingredientTotal);
  }, 0);

  const finalPrice = Math.max(0, totalPrice + (freeShipping ? 0 : deliveryPrice) - discount);

  const handleApplyPromoCode = async () => {
    if (!promoCode) {
      setPromoError("Введите промокод");
      return;
    }

    const cachedPromo = localStorage.getItem(`promo_${promoCode}`);
    if (cachedPromo) {
      const { discount, freeShipping, expiresAt } = JSON.parse(cachedPromo);
      if (new Date(expiresAt) > new Date()) {
        setDiscount(discount);
        setFreeShipping(freeShipping);
        setPromoError("");
        setIsPromoApplied(true);
        return;
      } else {
        localStorage.removeItem(`promo_${promoCode}`);
      }
    }

    try {
      const response = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode, totalAmount: totalPrice, userId: "1" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при применении промокода");
      }

      const { discount, freeShipping, expiresAt } = await response.json();
      setDiscount(discount);
      setFreeShipping(freeShipping);
      setPromoError("");
      setIsPromoApplied(true);

      localStorage.setItem(
        `promo_${promoCode}`,
        JSON.stringify({ discount, freeShipping, expiresAt })
      );
    } catch (err) {
      if (err instanceof Error) {
        setPromoError(err.message);
      } else {
        setPromoError("Произошла неизвестная ошибка");
      }
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setDiscount(0);
    setFreeShipping(false);
    setIsPromoApplied(false);
    localStorage.removeItem(`promo_${promoCode}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleCardClick = (item: { product: any }) => {
    setSelectedProduct(item.product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 max-w-[430px] mx-auto relative flex flex-col h-screen">
      <button onClick={handleGoHome} className="text-blue-500 text-lg">
        &#x2190; Вернуться на главную
      </button>
      <h1 className="text-2xl font-bold mb-4 mt-16">Корзина</h1>
      <div className="space-y-4">
        {Object.entries(cart).map(([id, item]) => {
          const ingredientTotal = item.ingredients?.reduce((acc, ing) => acc + ing.price, 0) || 0;
          const itemTotalPrice = item.count * (item.product.price + ingredientTotal);

          return (
            <div key={id} className="p-4 rounded-lg bg-gray-200" onClick={() => handleCardClick(item)}>
              <div className="flex">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="ml-4 flex flex-col justify-between">
                  <h3 className="text-lg font-bold">{item.product.name}</h3>
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm">Добавленные ингредиенты:</p>
                      <ul>
                        {item.ingredients.map((ing) => (
                          <li key={ing.id} className="text-xs">
                            {ing.name} (+{ing.price} ₽)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-bold">{itemTotalPrice} ₽</span>
                <div className="flex items-center bg-[#70B9BE] rounded-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseCount(item.id);
                    }}
                    className="px-3 py-1 text-white"
                  >
                    -
                  </button>
                  <span className="mx-3 text-lg">{item.count}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      increaseCount(item.id);
                    }}
                    className="px-3 py-1 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Введите промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={isPromoApplied}
          />
          {isPromoApplied ? (
            <button
              onClick={handleRemovePromoCode}
              className="bg-red-500 text-white px-4 rounded"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={handleApplyPromoCode}
              className="bg-[#70B9BE] text-white px-4 rounded"
            >
              Применить
            </button>
          )}
        </div>
        {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
        {isPromoApplied && !promoError && (
          <p className="text-green-500 text-sm mt-2">Промокод применен</p>
        )}
      </div>
      <div className="mt-4 mb-8">
        <div className="flex justify-between">
          <span>Итоговое количество товаров:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span>Итоговая сумма:</span>
          <span>{totalPrice} ₽</span>
        </div>
        <div className="flex justify-between">
          <span>Доставка:</span>
          <span>{freeShipping ? "Бесплатно" : `${deliveryPrice} ₽`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Скидка:</span>
            <span>-{discount} ₽</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Итого к оплате:</span>
          <span>{finalPrice} ₽</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-[#70B9BE] text-white py-2 rounded-full">
        Оформить заказ
      </button>

      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          cart={cart}
          handleAddToCart={() => {}}
        />
      )}
    </div>
  );
};

export default CartPage;
