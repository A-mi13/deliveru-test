"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Dish {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  link?: string;
}

interface Props {
  className?: string;
}

export const Popular: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [popularDishes, setPopularDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const fetchPopularDishes = async () => {
      // Имитируем задержку для тестирования

      const data = [
        {
          id: 1,
          name: "Пицца Маргарита",
          image: "/1.png",
          price: "500₽",
          description: "Вкусная пицца с томатами и базиликом",
          link: "/dishes/pizza1",
        },
        {
          id: 2,
          name: "Суши",
          image: "/2.png",
          price: "600₽",
          description: "Набор из свежих роллов и суши",
          link: "/dishes/sushi",
        },
        {
          id: 3,
          name: "Суши",
          image: "/2.png",
          price: "600₽",
          description: "Набор из свежих роллов и суши",
          link: "/dishes/sushi",
        },
      ];
      setPopularDishes(data);
    };

    fetchPopularDishes();
  }, []);

  const handleImageClick = (dish: Dish) => {
    if (dish.link) {
      router.push(dish.link);
    }
  };

  return (
    <div className={cn("px-[19px] mx-auto max-w-[430px]", className)}>
      <h1 className="text-black mb-4">Популярные блюда</h1>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 overflow-x-auto hide-scroll-bar"
          style={{ scrollbarWidth: "none" }} // Для Firefox
        >
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="p-2 rounded-[16px] w-[190px] h-[95px] flex-shrink-0 cursor-pointer flex items-center bg-[rgb(220,234,243)]"
              onClick={() => handleImageClick(dish)}
            >
              <img
                className="w-[65px] h-[65px] rounded-full"
                src={dish.image}
                alt={dish.name}
                loading="lazy" // Ленивая загрузка
              />
              <div className="ml-4">
                <h3 className="text-[12px] font-semibold">{dish.name}</h3>
                <p className="text-gray-600">{dish.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};