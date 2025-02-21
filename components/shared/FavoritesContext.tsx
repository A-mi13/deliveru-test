import React, { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextType {
  favorites: number[];
  addToFavorites: (productId: number) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
});

// Определяем интерфейс для элемента массива data
interface FavoriteItem {
  productId: number;
}

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const userId = 1; // Зашитый userId для разработки

  // Загрузка избранных товаров при монтировании компонента
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const data: FavoriteItem[] = await response.json(); // Указываем тип для data
        setFavorites(data.map((favorite) => favorite.productId));
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  // Добавление товара в избранное
  const addToFavorites = async (productId: number) => {
    try {
      const response = await fetch("/api/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId }),
      });
      if (!response.ok) {
        throw new Error("Failed to add to favorites");
      }
      setFavorites((prev) => [...prev, productId]);
    } catch (error) {
      console.error("Failed to add to favorites:", error);
    }
  };

  // Удаление товара из избранного
  const removeFromFavorites = async (productId: number) => {
    try {
      const response = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }
      setFavorites((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);