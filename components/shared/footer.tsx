"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, CartIcon } from "./icons"; // Иконки из icons.tsx
import SearchModal from "./searchModal";
import { cn } from "@/lib/utils";
import { SearchIcon, HeartIcon, UserIcon } from "lucide-react";
import { useCart } from "@/components/shared/CartContext"; // Импортируем контекст корзины
import { calculateTotalPrice } from "./priceCalculator";

interface Props {
  className?: string;
}

export const Footer: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { cart } = useCart(); // Получаем данные о корзине

  const toggleSearch = () => {
    setIsSearchVisible((prev) => !prev);
  };

  const isActive = (path: string) => pathname === path && !isSearchVisible;

  const handleHomeClick = () => {
    setIsSearchVisible(false); // Скрываем окно поиска
    if (pathname === "/") {
      router.replace("/"); // Принудительное обновление текущей страницы
    } else {
      window.location.href = "/"; // Переход на главную страницу
    }
  };

  // Закрываем окно поиска при смене маршрута
  useEffect(() => {
    setIsSearchVisible(false);
  }, [pathname]);

  // Рассчитываем общую сумму товаров в корзине
  const totalCartAmount = calculateTotalPrice(cart);
  console.log("Footer totalCartAmount:", totalCartAmount);

  return (
    <>
      <footer
        className={cn(
          "fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 max-w-[430px] w-full",
          className
        )}
      >
        <div className="relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 430 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M215 67.0001C237.644 67.0001 256 48.6438 256 26.0001C256 24.4802 255.917 22.9797 255.756 21.5027L407.327 1.05837C419.326 -0.560153 430 8.77084 430 20.8789V71.0001C430 82.0458 421.046 91.0001 410 91.0001H20C8.95432 91.0001 0 82.0458 0 71.0001V20.8789C0 8.77085 10.6741 -0.560154 22.6735 1.05837L174.244 21.5027C174.083 22.9797 174 24.4802 174 26.0001C174 48.6438 192.356 67.0001 215 67.0001Z"
              fill="#70B9BE"
            />
          </svg>

          {/* Кнопка корзины с отображением суммы */}
          <button
            className={`absolute left-1/2 transform -translate-x-1/2 -top-2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50 
            ${isActive("/cart") ? "bg-white text-[#70B9BE]" : "bg-[#70B9BE] text-white"}`}
            onClick={() => router.push("/cart")}
          >
            <div className="relative">
              <CartIcon fill={isActive("/cart") ? "#70B9BE" : "white"} />
              {/* Отображение суммы над иконкой */}
              {totalCartAmount > 0 && (
                <div className="absolute -top-6 -right-5 bg-[#F26E23] text-white text-xs w-16 h-16 rounded-full px-3 py-2">
                  {totalCartAmount}₽
                </div>
              )}
            </div>
          </button>

          {/* Навигационные кнопки */}
          <div className="flex items-center justify-between px-6 relative z-10 h-[91px]">
            <button
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                isActive("/") ? "bg-white text-[#70B9BE]" : "text-white hover:bg-white hover:text-[#70B9BE]"
              )}
              onClick={handleHomeClick}
            >
              <HomeIcon fill={isActive("/") ? "#70B9BE" : "white"} />
            </button>

            <button
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                isSearchVisible ? "bg-white text-[#70B9BE]" : "text-white hover:bg-white hover:text-[#70B9BE]"
              )}
              onClick={toggleSearch}
            >
              <SearchIcon size={24} />
            </button>

            <div className="w-16"></div>

            <button
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                isActive("/favorites") ? "bg-white text-[#70B9BE]" : "text-white hover:bg-white hover:text-[#70B9BE]"
              )}
              onClick={() => router.push("/favorites")}
            >
              <HeartIcon size={24} />
            </button>

            <button
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                isActive("/profile") ? "bg-white text-[#70B9BE]" : "text-white hover:bg-white hover:text-[#70B9BE]"
              )}
              onClick={() => router.push("/profile")}
            >
              <UserIcon size={24} />
            </button>
          </div>
        </div>
      </footer>

      {isSearchVisible && <SearchModal onClose={toggleSearch} />}
    </>
  );
};