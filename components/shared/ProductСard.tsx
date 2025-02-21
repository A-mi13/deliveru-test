import React from "react";
import { useCart } from "./CartContext"; 

interface Props {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  className?: string;
  quantity?: number;
  onIncreaseQuantity: (id: number) => void;
  onDecreaseQuantity: (id: number) => void;
  onOpenModal: () => void;
}

export const ProductCard: React.FC<Props> = ({ id, name, price, imageUrl, className }) => {
  const { cart, addToCart, increaseCount, decreaseCount } = useCart();

  const count = cart[id]?.count || 0;

  return (
    <div className={`p-4 bg-white rounded-md ${className}`}>
      <img src={imageUrl} alt={name} className="w-full h-32 object-cover rounded" />
      <h3 className="text-lg font-bold mt-2">{name}</h3>
      <p className="text-gray-600">{price}₽</p>
      <div className="flex items-center mt-2">
        {count > 0 ? (
          <div className="flex items-center">
            <button onClick={() => decreaseCount(id)}>-</button>
            <span className="mx-2">{count}</span>
            <button onClick={() => increaseCount(id)}>+</button>
          </div>
        ) : (
          <button className="bg-blue-500 text-white py-1 px-4 rounded" onClick={() => addToCart(id)}>
            Добавить
          </button>
        )}
      </div>
    </div>
  );
};
