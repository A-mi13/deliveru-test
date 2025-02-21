"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  createdAt: string;
  deliveryType: string;
  address: string;
  items: any; // Уточните тип данных для items, если возможно
  totalAmount: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/profile/orders");
        if (!response.ok) {
          throw new Error("Не удалось загрузить данные");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Загрузка...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-[430px] mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          className="text-[#FF0000] mr-4"
          onClick={() => router.push("/profile")}
        >
          ← Личный кабинет
        </button>
      </div>
      <h1 className="text-xl font-bold mb-6">История заказов</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">У Вас еще не было заказов :(</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-lg shadow-md mb-4 text-black"
          >
            <p className="text-sm font-semibold mb-2">№ {order.id}</p>
            <p className="text-sm text-gray-600 mb-1">
              {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {order.deliveryType}: {order.address}
            </p>
            <p className="text-sm text-black mb-2">
              {/* Если items — это массив, можно отобразить названия товаров */}
              {Array.isArray(order.items)
                ? order.items.map((item) => item.name).join(", ")
                : "Товары не указаны"}
            </p>
            <p className="text-sm font-bold mb-2">
              Сумма: {order.totalAmount} ₽
            </p>
            <button className="text-red-500 font-semibold">
              Повторить заказ
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersPage;