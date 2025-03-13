"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSwipeable } from "react-swipeable";

interface Address {
  id: number;
  address: string;
}

interface AddressListProps {
  addresses: Address[];
  onDelete: (id: number) => void;
  onEdit: (id: number, newAddress: string) => void;
  onAdd: (newAddress: string) => void;
  onSelect: (address: string) => void; // Новый пропс для выбора адреса
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onDelete,
  onEdit,
  onAdd,
  onSelect, // Добавляем пропс для выбора адреса
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingAddress, setEditingAddress] = useState("");
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const target = eventData.event.currentTarget as HTMLElement;
      const index = Number(target.dataset.index);
      setSwipedIndex(index);
    },
    onSwipedRight: () => {
      setSwipedIndex(null);
    },
    trackMouse: true,
  });

  const handleAddAddress = () => {
    onAdd(newAddress);
    setIsAdding(false);
    setNewAddress("");
  };

  const handleSaveEditedAddress = (index: number) => {
    onEdit(addresses[index].id, editingAddress);
    setEditingIndex(null);
    setEditingAddress("");
  };

  const handleAddressClick = (address: string) => {
    onSelect(address); // Вызываем onSelect при выборе адреса
  };

  return (
    <div className="max-w-[430px] mx-auto px-4 py-6">
      {addresses.length === 0 ? (
        <p className="text-center text-gray-500">Пусто</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <div
              key={address.id}
              className="relative overflow-hidden"
              {...swipeHandlers}
              data-index={index}
              onClick={() => handleAddressClick(address.address)} // Выбор адреса
            >
              <div
                className={`p-4 bg-white rounded-lg shadow-md transition-transform duration-300 ${
                  swipedIndex === index ? "transform -translate-x-20" : ""
                }`}
              >
                {editingIndex === index ? (
                  <div>
                    <input
                      type="text"
                      value={editingAddress}
                      onChange={(e) => setEditingAddress(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE] mb-2"
                    />
                    <button
                      onClick={() => handleSaveEditedAddress(index)}
                      className="w-full bg-[#70B9BE] text-white p-2 rounded-md"
                    >
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-black text-sm">{address.address}</p>
                    <button
                      className="text-[#70B9BE] ml-4"
                      onClick={(e) => {
                        e.stopPropagation(); // Останавливаем всплытие события
                        setEditingIndex(index);
                        setEditingAddress(address.address);
                      }}
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
              {swipedIndex === index && (
                <div
                  className="absolute top-0 right-0 rounded-lg h-full w-20 flex items-center justify-center bg-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Останавливаем всплытие события
                    onDelete(address.id);
                  }}
                >
                  <Trash2 className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button className="text-[#70B9BE] mt-6" onClick={() => setIsAdding(true)}>
        + Добавить адрес
      </button>
      {isAdding && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            placeholder="Введите адрес"
          />
          <div className="mt-4 flex justify-between">
            <button
              className="text-gray-500"
              onClick={() => setIsAdding(false)}
            >
              Отмена
            </button>
            <button
              className="bg-[#70B9BE] text-white p-2 rounded-md"
              onClick={handleAddAddress}
            >
              Добавить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressList;