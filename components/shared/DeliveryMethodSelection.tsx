"use client";

import React, { useState } from "react";
import PickupPointsMap from "./PickupPointsMap"; // Компонент карты самовывоза
import AddressList from "./AddressList"; // Импортируем новый компонент
import { useCart } from "@/components/shared/CartContext"; // Импортируем контекст корзины

const deliveryMethods = [
  {
    id: "pickup",
    title: "Самовывоз",
    image: "/pickup.png", // Путь к изображению
  },
  {
    id: "courier",
    title: "Курьером",
    image: "/courier.png", // Путь к изображению
  },
  {
    id: "transport",
    title: "Транспортной компанией",
    image: null, // Нет изображения
  },
];

const deliveryTimes = [
  { value: "asap", label: "Как можно скорее" },
  { value: "12-14", label: "12:00 - 14:00" },
  { value: "14-16", label: "14:00 - 16:00" },
  { value: "16-18", label: "16:00 - 18:00" },
  { value: "18-20", label: "18:00 - 20:00" },
  { value: "20-22", label: "20:00 - 22:00" },
];

const DeliveryMethodSelection: React.FC<{ onSelect: (method: string) => void }> = ({ onSelect }) => {
  const { cart, totalPrice, deliveryPrice, discount, freeShipping } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [deliveryTime, setDeliveryTime] = useState("asap");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [payment, setPayment] = useState("СПБ");
  const [comment, setComment] = useState("");
  const [addresses, setAddresses] = useState([
    { id: 1, address: "Ставрополь, ул. 50 лет ВЛКСМ, 113" },
    { id: 2, address: "Ставрополь, пр. Кулакова, 15" },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(""); // Новое состояние

  const handleMethodSelect = (methodId: string) => {
    setDeliveryMethod(methodId);
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleEditAddress = (id: number, newAddress: string) => {
    setAddresses(
      addresses.map((addr) => (addr.id === id ? { ...addr, address: newAddress } : addr))
    );
  };

  const handleAddAddress = (newAddress: string) => {
    setAddresses([...addresses, { id: Date.now(), address: newAddress }]);
  };

  const handleSelectAddress = (address: string) => {
    setSelectedAddress(address); // Обновляем выбранный адрес
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeliveryTime(e.target.value);
    setShowTimeDropdown(false);
  };

  const finalPrice = totalPrice + (freeShipping ? 0 : deliveryPrice) - discount;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Способ получения</h2>

      {/* Переключение метода доставки */}
      <div className="flex gap-2 mb-4">
        {deliveryMethods.map((method) => (
          <div
            key={method.id}
            className={`w-[124px] h-[173px] p-4 rounded-lg shadow-md cursor-pointer flex flex-col items-center justify-between transition-all ${deliveryMethod === method.id
                ? "bg-[#70B9BE] text-white"
                : "bg-gray-100 text-gray-800"
              } ${method.id === "transport" ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="text-sm font-semibold text-center">{method.title}</div>
            {method.image ? (
              <img src={method.image} alt={method.title} className="w-[94px] h-[127px] object-cover rounded-md" />
            ) : (
              <div className="w-[94px] h-[127px] flex items-center justify-center text-gray-500">🚛</div>
            )}
          </div>
        ))}
      </div>

      {/* Отображение выбранного метода */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Способ получения: {deliveryMethods.find((method) => method.id === deliveryMethod)?.title}
        </h3>

        {deliveryMethod === "pickup" && <PickupPointsMap />}
        {deliveryMethod === "courier" && (
          <>
            <AddressList
              addresses={addresses}
              onDelete={handleDeleteAddress}
              onEdit={handleEditAddress}
              onAdd={handleAddAddress}
              onSelect={handleSelectAddress} // Передаем обработчик выбора адреса
            />
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Адрес доставки</label>
              <input
                type="text"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </>
        )}
        {deliveryMethod === "transport" && (
          <div className="text-gray-600">
            <p>Выберите транспортную компанию:</p>
          </div>
        )}
      </div>

      {/* Время доставки */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Время доставки</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 p-2 border rounded-lg ${deliveryTime === "asap" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setDeliveryTime("asap")}
          >
            Как можно скорее
          </button>
          <button
            className={`flex-1 p-2 border rounded-lg ${deliveryTime === "12-14" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setDeliveryTime("12-14")}
          >
            12:00 - 14:00
          </button>
          <button
            className={`flex-1 p-2 border rounded-lg ${deliveryTime !== "asap" && deliveryTime !== "12-14" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            {deliveryTime !== "asap" && deliveryTime !== "12-14"
              ? deliveryTimes.find((time) => time.value === deliveryTime)?.label
              : "Другое время"}
          </button>
        </div>
        {showTimeDropdown && (
          <select
            className="w-full p-2 border rounded-lg mt-2"
            onChange={handleTimeChange}
            value={deliveryTime}
          >
            {deliveryTimes.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Оплата */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Оплата</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 p-2 border rounded-lg ${payment === "СПБ" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setPayment("СПБ")}
          >
            СПБ
          </button>
          <button
            className={`flex-1 p-2 border rounded-lg ${payment === "Картой при получении" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setPayment("Картой при получении")}
          >
            Картой при получении
          </button>
          <button
            className={`flex-1 p-2 border rounded-lg ${payment === "Наличными курьеру" ? "border-teal-500 bg-teal-100" : "border-gray-300"
              }`}
            onClick={() => setPayment("Наличными курьеру")}
          >
            Наличными курьеру
          </button>
        </div>
      </div>

      {/* Комментарий к заказу */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Комментарий к заказу</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-lg"
          rows={3}
          placeholder="Введите комментарий..."
        />
      </div>

      {/* Итоговая сумма */}
      <div className="mb-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Стоимость заказа</span>
          <span>{totalPrice} ₽</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Доставка</span>
          <span>{freeShipping ? "Бесплатно" : `${deliveryPrice} ₽`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Скидка</span>
            <span>-{discount} ₽</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Итого к оплате:</span>
          <span>{finalPrice} ₽</span>
        </div>
      </div>

      {/* Кнопка заказа */}
      <button className="w-full bg-teal-500 text-white py-3 rounded-lg text-lg">
        Заказать
      </button>
    </div>
  );
};

export default DeliveryMethodSelection;