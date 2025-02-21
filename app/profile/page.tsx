"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface DeliveryAddress {
  id: number;
  address: string;
  isDefault: boolean;
}

interface Bonus {
  id: number;
  amount: number;
  expiresAt: string;
}

const PersonalAccount: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [bonuses, setBonuses] = useState<Bonus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, addressesResponse, bonusesResponse] = await Promise.all([
          fetch("/api/profile/orders"),
          fetch("/api/profile/addresses"),
          fetch("/api/profile/bonuses"),
        ]);
        const ordersData = await ordersResponse.json();
        const addressesData = await addressesResponse.json();
        const bonusesData = await bonusesResponse.json();

        setOrders(ordersData);
        setAddresses(addressesData);
        setBonuses(bonusesData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGoHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black max-w-[430px] mx-auto bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[430px] mx-auto px-4 py-6 relative">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoHome}
          className="flex items-center text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.push("/profile/settings")}
          className="flex items-center text-gray-600 hover:text-black"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <h1 className="text-2xl font-bold flex-grow text-black mb-6">
        ЛИЧНЫЙ КАБИНЕТ
      </h1>

      <div className="grid grid-cols-3 gap-4 justify-center">
        <div
          onClick={() => router.push("/profile/orders")}
          className="w-[124px] h-[173px] rounded-lg shadow-md flex flex-col items-start justify-between cursor-pointer bg-[#F5F5F5] p-2"
        >
          <p className="text-black text-lg font-semibold">Мои заказы</p>
          <div className="bg-white px-3 py-1 rounded-full text-black text-sm font-medium self-start">
            {orders.length} {orders.length === 1 ? "заказ" : "заказа"}
          </div>
        </div>

        <div
          onClick={() => router.push("/profile/address")}
          className="w-[124px] h-[173px] rounded-lg shadow-md flex flex-col items-start justify-between cursor-pointer bg-[#F5F5F5] p-2"
        >
          <p className="text-black text-lg font-semibold">Адрес доставки</p>
          <div className="bg-white px-3 py-1 rounded-full text-black text-sm font-medium self-start">
            {addresses.length} {addresses.length === 1 ? "адрес" : "адреса"}
          </div>
        </div>

        <div className="w-[124px] h-[173px] rounded-lg shadow-md flex flex-col items-start justify-between cursor-pointer bg-[#F5F5F5] p-2">
          <p className="text-black text-lg font-semibold">Бонусы</p>
          <div className="bg-white px-3 py-1 rounded-full text-black text-sm font-medium self-start">
            {bonuses ? `${bonuses.amount} ${bonuses.amount === 1 ? "бонус" : "бонусов"}` : "0 бонусов"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAccount;
