"use client";

import React, { useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

const pickupPoints = [
  { id: 1, coords: [55.751574, 37.573856], address: "Москва, ул. Тверская, 7" },
  { id: 2, coords: [55.754932, 37.621393], address: "Москва, ул. Арбат, 25" },
];

const PickupPointsMap: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState(pickupPoints[0]); // По умолчанию первая точка
  const [showMap, setShowMap] = useState(false);

  // Обновление точки самовывоза при клике на Placemark
  const handlePointSelect = (point: (typeof pickupPoints)[0]) => {
    setSelectedPoint(point);
    setShowMap(false); // Закрываем карту после выбора
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-600 mb-1">Самовывоз</label>

      {/* Select с выбором точки самовывоза */}
      <select
        value={selectedPoint.address}
        onChange={(e) => {
          const point = pickupPoints.find((p) => p.address === e.target.value);
          if (point) setSelectedPoint(point);
        }}
        className="w-full p-2 border rounded-lg"
      >
        {pickupPoints.map((point) => (
          <option key={point.id} value={point.address}>
            {point.address}
          </option>
        ))}
      </select>

      {/* Кнопка выбора точки на карте */}
      <button
        onClick={() => setShowMap(true)}
        className="w-full mt-2 p-2 border rounded-lg bg-gray-100"
      >
        Выбрать на карте
      </button>

      {/* Карта с точками самовывоза (отображается при showMap) */}
      {showMap && (
        <div className="relative mt-2">
          <YMaps query={{ apikey: "0b05f0f2-29f9-4e78-a320-477441b055d9" }}>
            <Map
              defaultState={{ center: selectedPoint.coords, zoom: 12 }}
              className="w-full h-[400px]"
            >
              {pickupPoints.map((point) => (
                <Placemark
                  key={point.id}
                  geometry={point.coords}
                  properties={{ hintContent: point.address }}
                  options={{ preset: "islands#redIcon" }}
                  onClick={() => handlePointSelect(point)}
                />
              ))}
            </Map>
          </YMaps>

          {/* Кнопка закрытия карты */}
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupPointsMap;
