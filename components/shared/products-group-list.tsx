import React from "react";
import { Title } from "./title";
import { ProductCard } from "./ProductСard";
import { cn } from "@/lib/utils";

// Определяем интерфейс для элемента массива items
interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  categoryId: number;
}

interface Props {
  title: string;
  items: Product[]; // Используем интерфейс Product вместо any
  className?: string;
  categoryId: number;
  listClassName?: string;
}

export const ProductsGroupList: React.FC<Props> = ({ title, items, className, categoryId, listClassName }) => {
  const filteredItems = items.filter((item) => item.categoryId === categoryId);

  return (
    <div className={cn("p-4", className)}>
      <Title text={title} size="lg" className="font-extrabold mb-5" />
      <div className={cn("grid grid-cols-2 gap-[10px]", listClassName)}>
        {filteredItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            price={item.price} onIncreaseQuantity={function (id: number): void {
              throw new Error("Function not implemented.");
            } } onDecreaseQuantity={function (id: number): void {
              throw new Error("Function not implemented.");
            } } onOpenModal={function (): void {
              throw new Error("Function not implemented.");
            } }          />
        ))}
      </div>
    </div>
  );
};