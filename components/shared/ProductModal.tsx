"use client";
import React, { useEffect, useState, useRef } from "react";
import { Product } from "@prisma/client";
import { HeartIcon } from "lucide-react";
import { useFavorites } from "./FavoritesContext";
import Notification from "./Notification";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import { calculateItemTotalPrice } from "./priceCalculator";

// Маппинг для отображения размеров
const sizeMapping: { [key: number]: string } = {
  1: "маленький",
  2: "средний",
  3: "большой",
};

const getSizeLabel = (size: number | null) => {
  return size !== null && sizeMapping[size] ? sizeMapping[size] : "Неизвестный размер";
};

interface ProductItem {
  id: number;
  size: number | null;  // Размер теперь число
  price: number;
}

interface ProductModalProps {
  product: Product & { items?: ProductItem[] }; // Добавляем поле для вариаций продукта
  onClose: () => void;
  cart: Record<number, any>;
  handleAddToCart: (productId: number, productItemId?: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  cart,
  handleAddToCart,
}) => {
  const { addIngredient, removeIngredient, allIngredients, isLoading } = useCart();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const startY = useRef<number | null>(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [notification, setNotification] = useState<{
    message: string;
    backgroundColor: string;
  } | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined); // Состояние для выбранного размера (ID вариации)
  const router = useRouter();

  const isFavorite = favorites.includes(product.id);
  const isInCart = Boolean(
    Object.values(cart).find(
      (item) =>
        item.product.id === product.id && item.productItem?.id === selectedSize
    )
  );

  // Находим текущий элемент корзины для выбранной вариации
  const cartItem =
    Object.values(cart).find(
      (item) =>
        item.product.id === product.id && item.productItem?.id === selectedSize
    ) || { count: 0, ingredients: [] };

  // Устанавливаем выбранную вариацию при открытии модального окна
  useEffect(() => {
    // Находим элемент корзины для текущего продукта
    const cartItem = Object.values(cart).find(
      (item) => item.product.id === product.id
    );

    if (cartItem && cartItem.productItem?.id) {
      // Если продукт уже в корзине, выбираем вариацию из корзины
      setSelectedSize(cartItem.productItem.id);
    } else if (product.items && product.items.length > 0) {
      // Если продукта нет в корзине, выбираем вариацию с минимальной стоимостью
      const minPriceItem = product.items.reduce((minItem, currentItem) => {
        return currentItem.price < (minItem?.price ?? Infinity) ? currentItem : minItem;
      }, product.items[0]);
      setSelectedSize(minPriceItem.id);
    }
  }, [cart, product]); // Пустой массив зависимостей, чтобы useEffect сработал только при монтировании

  // Получаем цену выбранной вариации
  const selectedProductItem = product.items?.find((item) => item.id === selectedSize);
  const priceToDisplay = selectedProductItem?.price || product.price; // Если вариация не выбрана, показываем цену продукта

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
      setNotification({
        message: "УДАЛЕНО ИЗ ИЗБРАННОГО",
        backgroundColor: "bg-red-500",
      });
    } else {
      addToFavorites(product.id);
      setNotification({
        message: "ДОБАВЛЕНО В ИЗБРАННОЕ",
        backgroundColor: "bg-green-500",
      });
    }
  };

  const handleAddIngredient = async (ingredientId: number) => {
    if (!isInCart) {
      await handleAddToCart(product.id, selectedSize);
    }
    setTimeout(() => addIngredient(product.id, ingredientId, selectedSize), 100);
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    removeIngredient(product.id, ingredientId);
  };

  const totalPrice = calculateItemTotalPrice({
    productItem: selectedProductItem,
    product,
    ingredients: cartItem.ingredients,
    count: cartItem.count || 1,
  });

  console.log("ProductModal totalPrice:", totalPrice);

  if (isLoading) {
    return <div>Loading ingredients...</div>;
  }

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`bg-white max-w-[430px] w-full ${
          isFullScreen ? "h-[100%]" : "h-[70%]"
        } rounded-t-lg p-4 relative overflow-y-auto no-scrollbar transition-all duration-300`}
      >
        {/* Ползунок для изменения высоты */}
        <div
          className="w-[134px] h-[5px] bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"
          onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (startY.current === null) return;
            const deltaY = e.touches[0].clientY - startY.current;
            if (deltaY < -50) setIsFullScreen(true);
            if (deltaY > 50) setIsFullScreen(false);
          }}
          onTouchEnd={() => (startY.current = null)}
        />
        {/* Кнопка закрытия */}
        <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>
          ×
        </button>
        {/* Изображение продукта */}
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md"
          />
          <button className="absolute bottom-2 right-2" onClick={toggleFavorite}>
            <HeartIcon
              size={24}
              className={isFavorite ? "text-[#70B9BE]" : "text-gray-300"}
            />
          </button>
        </div>
        {/* Уведомление */}
        {notification && (
          <Notification
            message={notification.message}
            onClose={() => setNotification(null)}
            backgroundColor={notification.backgroundColor}
          />
        )}
        {/* Название и цена продукта */}
        <h3 className="text-xl w-full font-bold mt-2">{product.name}</h3>
        {product.price && <p className="text-lg mt-1">{product.price}₽</p>}
        <p className="mt-2">Описание товара...</p>
        {/* Выбор размера через кнопки */}
        {product.items && product.items.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Размер</label>
            <div className="flex gap-2 justify-center">
              {product.items.map((item) => (
                <button
                  key={item.id}
                  className={`bg-[#70B9BE] text-white px-4 py-2 rounded-full transition-colors ${
                    selectedSize === item.id ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedSize(item.id)}
                >
                  {/* Отображаем текстовое описание размера */}
                  {getSizeLabel(item.size)}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Ингредиенты */}
        {product.categoryId !== 3 && (
          <div className="pb-20">
            <div className="grid grid-cols-3 gap-2 mt-4 pb-2">
              {(showAllIngredients ? allIngredients : allIngredients.slice(0, 3)).map((ingredient) => (
                <div key={ingredient.id} className="flex flex-col items-center">
                  <img
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <p className="text-sm text-gray-600">{ingredient.price}₽</p>
                  <p className="text-sm min-h-10 mt-1 font-semibold">{ingredient.name}</p>
                  <div className="flex items-center justify-center w-full mt-auto">
                    <button
                      className="bg-[#70B9BE] w-full text-white px-2 py-1 rounded-full"
                      onClick={() => handleAddIngredient(ingredient.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {allIngredients.length > 3 && (
              <button
                className="text-[#70B9BE]"
                onClick={() => setShowAllIngredients(!showAllIngredients)}
              >
                {showAllIngredients ? "Скрыть" : "Показать все"}
              </button>
            )}
          </div>
        )}
        {/* Кнопка добавления в корзину */}
        <div className="fixed max-w-[430px] mx-auto bottom-0 left-0 right-0 bg-white p-4">
          {isInCart ? (
            <button
              className="flex items-center justify-center bg-[#70B9BE] text-white w-full py-3 rounded-full"
              onClick={() => router.push("/cart")}
            >
              В корзине за {totalPrice}₽
            </button>
          ) : (
            <button
              className="bg-[#70B9BE] text-white w-full py-3 rounded-full"
              onClick={() => {
                if (product.items && product.items.length > 0 && !selectedSize) {
                  alert("Пожалуйста, выберите размер");
                  return;
                }
                console.log("Добавляю в корзину:", selectedSize);
                handleAddToCart(product.id, selectedSize);
              }}
            >
              Добавить в корзину за {priceToDisplay}₽
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;