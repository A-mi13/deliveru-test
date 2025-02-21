"use client";

import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  onClose: () => void;
  backgroundColor?: string;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  onClose,
  backgroundColor = "bg-green-500",
}) => {
  useEffect(() => {
    console.log("Notification rendered:", message); // Логируем рендеринг уведомления

    const timer = setTimeout(() => {
      onClose(); // Автоматическое закрытие через 5 секунд
    }, 5000);

    return () => clearTimeout(timer); // Очистка таймера при размонтировании
  }, [onClose, message]); // Добавляем message в зависимости

  return (
    <div
      className={`fixed bottom-4 right-4 ${backgroundColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        ×
      </button>
    </div>
  );
};

export default Notification;