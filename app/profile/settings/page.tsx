"use client";
import React, { useState, useEffect } from "react";

interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
}

const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthDate: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true); // Флаг для отслеживания загрузки

  // Получение данных пользователя при загрузке страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users?id=1"); // Замените ID на реальный
        if (!response.ok) {
          throw new Error("Не удалось загрузить данные пользователя");
        }

        const user = await response.json();
        const { fullName, email, phone, birthDate } = user;

        // Разделяем fullName на firstName и lastName
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");

        setFormData({
          firstName: firstName || "",
          lastName: lastName || "",
          phone: phone || "",
          email: email || "",
          birthDate: birthDate ? birthDate.split("T")[0] : "",
        });
      } catch (error) {
        console.error(error);
        alert("Произошла ошибка при загрузке данных пользователя");
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    let valid = true;
    const newErrors: any = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Имя обязательно";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Некорректный email";
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон обязателен";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const saveSettings = async () => {
    if (!validate()) return;

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1, // Замените на реальный ID пользователя
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate,
        }),
      });

      if (response.ok) {
        alert("Настройки сохранены");
      } else {
        alert("Ошибка сохранения");
      }
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при сохранении данных");
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4">
      <div className="max-w-[430px] mx-auto">
        <div className="flex items-center mb-6">
          <button
            className="text-[#FF0000] mr-4"
            onClick={() => window.location.href = "/profile"}
          >
            ← Личный кабинет
          </button>
          <h1 className="text-xl font-bold">Настройки</h1>
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
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE] ${
                errors.firstName ? "border-red-500" : ""
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
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
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE] ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
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
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE] ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
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
              max={new Date().toISOString().split("T")[0]}
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
            onClick={saveSettings}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;