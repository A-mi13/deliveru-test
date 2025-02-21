"use client";

import React, { useState, useEffect } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { Trash2 } from "lucide-react";

declare global {
  interface Window {
    ymaps: any; // Используем глобальный ymaps объект
  }
}

interface YMapEvent {
  get: (key: string) => any;
  originalEvent: MouseEvent;
}

interface Address {
  id: number;
  address: string;
}

const DeliveryAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.0355, 41.968]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingAddress, setEditingAddress] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [ymapsLoaded, setYmapsLoaded] = useState(false);
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAddresses(data);
        }
      })
      .catch((error) => console.error("Ошибка при загрузке адресов:", error));
  }, []);

  useEffect(() => {
    if (window.ymaps) {
      setYmapsLoaded(true); // Карты уже загружены
      return; // Если уже загружены, ничего не делаем
    }
  
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=0b05f0f2-29f9-4e78-a320-477441b055d9`;
    script.async = true;
    script.onload = () => {
      console.log("Яндекс.Карты успешно загружены");
      setYmapsLoaded(true);
    };
    script.onerror = (e) => {
      console.error("Ошибка при загрузке Яндекс.Карт:", e);
    };
    document.body.appendChild(script);
  }, []);

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

  const deleteAddress = async (id: number) => {
    try {
      const response = await fetch("/api/profile/addresses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setAddresses(addresses.filter((address) => address.id !== id));
        setSwipedIndex(null);
      } else {
        console.error("Ошибка при удалении адреса:", await response.json());
      }
    } catch (error) {
      console.error("Ошибка при удалении адреса:", error);
    }
  };

  const fetchAddressFromCoords = async (coords: [number, number]): Promise<string> => {
    if (!window.ymaps) {
      console.error("Yandex Maps API не загружен");
      return "Адрес не определен";
    }

    try {
      const myGeocoder = window.ymaps.geocode(coords);
      const res = await myGeocoder;
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const text = firstGeoObject.properties.get("text", {});
        return text?.toString() || "Не удалось определить адрес";
      }
      return "Не удалось определить адрес";
    } catch (error) {
      console.error("Ошибка при геокодировании:", error);
      return "Не удалось определить адрес";
    }
  };

  const addAddress = async () => {
    if (newAddress.trim()) {
      try {
        const response = await fetch("/api/profile/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: newAddress }),
        });

        if (response.ok) {
          const newAddressData = await response.json();
          setAddresses([...addresses, newAddressData]);
          setNewAddress("");
          setIsAdding(false);
        } else {
          console.error("Ошибка при добавлении адреса:", await response.json());
        }
      } catch (error) {
        console.error("Ошибка при добавлении адреса:", error);
      }
    }
  };

  const saveEditedAddress = () => {
    if (editingIndex !== null && editingAddress.trim()) {
      const updatedAddresses = [...addresses];
      updatedAddresses[editingIndex].address = editingAddress;
      setAddresses(updatedAddresses);
      setEditingIndex(null);
      setEditingAddress("");
    }
  };

  const handleMapClick = async (e: YMapEvent, isEditing: boolean) => {
    if (!window.ymaps) {
      console.error("Yandex Maps API не загружен");
      return;
    }

    const coords: [number, number] = e.get('coords');
    if (!coords) return;

    const readableAddress = await fetchAddressFromCoords(coords);
    const addressToSet = readableAddress || "Не удалось определить адрес";

    if (isEditing) {
      setEditingAddress(addressToSet);
    } else {
      setNewAddress(addressToSet);
    }
    setMapCenter(coords);
  };

  const handleAddressInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setNewAddress(inputValue);

    if (!inputValue.trim() || !window.ymaps) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const geocoder = await window.ymaps.geocode(inputValue, { results: 5 });
      const suggestions: string[] = [];

      geocoder.geoObjects.each((geoObj: any) => {
        const text = geoObj.properties?.get('text');
        if (text) suggestions.push(text);
      });

      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error("Ошибка при автозаполнении:", error);
      setAddressSuggestions([]);
    }
  };

  const handleAddressSelect = async (address: string) => {
    setNewAddress(address);
    setAddressSuggestions([]);

    if (!window.ymaps) {
      console.error("Yandex Maps API не загружен");
      return;
    }

    try {
      const geocoder = await window.ymaps.geocode(address);
      const firstGeoObject = geocoder.geoObjects.get(0);

      if (firstGeoObject && firstGeoObject.geometry) {
        const geometry = firstGeoObject.geometry as any;
        const coords = geometry.getCoordinates();
        if (coords) {
          setMapCenter(coords as [number, number]);
        }
      }
    } catch (error) {
      console.error("Ошибка при геокодировании выбранного адреса:", error);
    }
  };

  return (
    <div className="max-w-[430px] mx-auto px-4 py-6">
      <button className="text-[#FF0000] mr-4" onClick={() => router.push("/profile")}>
        ← Личный кабинет
      </button>
      <h1 className="text-xl font-bold mb-6">Адрес доставки</h1>
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
                    <div className="h-[300px] w-full mb-2">
                      {ymapsLoaded && (
                        <Map
                          state={{
                            center: mapCenter,
                            zoom: 12,
                          }}
                          className="w-full h-full rounded-md"
                          onClick={(e: YMapEvent) => handleMapClick(e, true)}
                        >
                          <Placemark geometry={mapCenter} />
                        </Map>
                      )}
                    </div>
                    <button
                      onClick={saveEditedAddress}
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
                      onClick={() => {
                        setEditingIndex(index);
                        setEditingAddress(address.address);
                        setMapCenter([45.0355, 41.968]);
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
                  onClick={() => deleteAddress(address.id)}
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
            onChange={handleAddressInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#70B9BE]"
            placeholder="Введите адрес"
          />
          <div className="mt-2 max-h-[200px] overflow-y-auto">
            {addressSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 cursor-pointer hover:bg-[#f0f0f0]"
                onClick={() => handleAddressSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
          <div className="h-[300px] w-full mb-2">
            <YMaps>
              <Map
                state={{
                  center: mapCenter,
                  zoom: 12,
                }}
                className="w-full h-full rounded-md"
                onClick={(e: YMapEvent) => handleMapClick(e, false)}
              >
                <Placemark geometry={mapCenter} />
              </Map>
            </YMaps>
          </div>
          <div className="mt-4 flex justify-between">
            <button
              className="text-gray-500"
              onClick={() => setIsAdding(false)}
            >
              Отмена
            </button>
            <button
              className="bg-[#70B9BE] text-white p-2 rounded-md"
              onClick={addAddress}
            >
              Добавить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressesPage;
