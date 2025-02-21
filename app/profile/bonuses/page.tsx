"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "Александр",
    lastName: "",
    phone: "+7 928 955 33 14",
    email: "info@pranait.ru",
    birthDate: "1988-11-30",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4">
      {/* Контейнер для максимальной ширины 430px */}
      <div className="max-w-[430px] mx-auto">
        <div className="flex items-center mb-6">
          <button
            className="text-[#FF0000] mr-4"
            onClick={() => router.push("/profile")}
          >
            ← Личный кабинет
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Почта
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата рождения
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">
              Уведомление о скидках
            </p>
            <input
              type="checkbox"
              className="w-6 h-6 text-[#70B9BE] border-gray-300 rounded focus:ring-[#70B9BE]"
            />
          </div>

          <button
            className="w-full bg-[#70B9BE] text-white p-2 rounded-md mt-4"
            onClick={() => alert("Настройки сохранены")}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;