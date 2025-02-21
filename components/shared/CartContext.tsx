"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";


interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
}

interface Ingredient {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  id: number;
  count: number;
  product: Product;
  ingredients?: Ingredient[];
}

interface CartContextProps {
  cart: Record<number, CartItem>;
  setCart: (cart: Record<number, CartItem>) => void;
  addToCart: (id: number) => void;
  increaseCount: (id: number) => void;
  decreaseCount: (id: number) => void;
  addIngredient: (productId: number, ingredientId: number) => void;
  removeIngredient: (productId: number, ingredientId: number) => void;
  isLoading: boolean;
  error: string | null;
  allIngredients: Ingredient[];
  updateTotalAmount: (totalAmount: number) => Promise<void>; // Добавляем функцию для обновления totalAmount
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  const fetchCartFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart?userId=1");
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
  
      // Преобразуем данные в формат, который ожидается в состоянии корзины
      const cartItems = data.items.reduce((acc: Record<number, CartItem>, item: any) => {
        acc[item.id] = {
          id: item.id,
          count: item.count,
          product: item.product,
          ingredients: item.ingredients || [], // Добавляем ингредиенты
        };
        return acc;
      }, {});
  
      setCart(cartItems);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Failed to fetch cart. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartFromServer();
  }, [fetchCartFromServer]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setAllIngredients(data);
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
        setError("Failed to fetch ingredients. Please try again later.");
      }
    };

    fetchIngredients();
  }, []);

  const updateTotalAmount = useCallback(async (totalAmount: number) => {
    try {
      const response = await fetch("/api/cart/updateTotalAmount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, totalAmount }), // Замените "1" на реальный userId
      });
  
      if (!response.ok) {
        throw new Error("Ошибка при обновлении totalAmount");
      }
    } catch (error) {
      console.error("Ошибка при обновлении totalAmount:", error);
      setError("Ошибка при обновлении корзины. Пожалуйста, попробуйте позже.");
    }
  }, []);

  const addToCart = useCallback(async (id: number) => {
    try {
      // Получаем продукт из базы данных
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();
  
      if (!product) throw new Error("Product not found");
  
      // Добавляем продукт в корзину
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: 1, userId: 1 }),
      });
  
      setCart((prev) => ({
        ...prev,
        [id]: prev[id]
          ? { ...prev[id], count: prev[id].count + 1 }
          : { id, count: 1, product, ingredients: [] },
      }));
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setError("Failed to add to cart. Please try again later.");
    }
  }, []);

  const increaseCount = useCallback(
    async (id: number) => {
      try {
        await fetch("/api/cart/increase", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, userId: 1 }),
        });
  
        setCart((prev) => {
          const updatedItem = prev[id];
          const newCount = updatedItem.count + 1;
          const ingredientsCost = updatedItem.ingredients?.reduce(
            (sum, ingredient) => sum + ingredient.price,
            0
          ) || 0;
  
          const newTotalPrice =
            updatedItem.product.price * newCount + ingredientsCost * newCount;
  
          // Обновляем totalAmount на сервере
          updateTotalAmount(newTotalPrice);
  
          return {
            ...prev,
            [id]: { ...updatedItem, count: newCount, totalPrice: newTotalPrice },
          };
        });
      } catch (error) {
        console.error("Ошибка при увеличении количества:", error);
        setError("Ошибка при увеличении количества. Пожалуйста, попробуйте позже.");
      }
    },
    [updateTotalAmount]
  );

  const decreaseCount = useCallback(async (id: number) => {
    try {
      const productItemId = cart[id]?.id; // Используем правильный id
      if (!productItemId) return;
  
      await fetch("/api/cart/decrease", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productItemId, userId: 1 }),
      });
  
      setCart((prev) => {
        const updatedCart = { ...prev };
        if (updatedCart[id]) {
          if (updatedCart[id].count > 1) {
            updatedCart[id] = { ...updatedCart[id], count: updatedCart[id].count - 1 };
          } else {
            delete updatedCart[id];
          }
        }
        return updatedCart;
      });
    } catch (error) {
      console.error("Failed to decrease count:", error);
      setError("Failed to decrease count. Please try again later.");
    }
  }, [cart]);

  const addIngredient = useCallback(async (productId: number, ingredientId: number) => {
    try {
      const ingredient = allIngredients.find((ing) => ing.id === ingredientId);
      if (!ingredient) throw new Error("Ingredient not found");

      setCart((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          ingredients: [...(prev[productId]?.ingredients || []), ingredient],
        },
      }));

      await fetch("/api/cart/addIngredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ingredientId, userId: 1 }),
      });
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      setError("Failed to add ingredient. Please try again later.");
    }
  }, [allIngredients]);

  const removeIngredient = useCallback(async (productId: number, ingredientId: number) => {
    try {
      setCart((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          ingredients: prev[productId]?.ingredients?.filter((ing) => ing.id !== ingredientId) || [],
        },
      }));

      await fetch("/api/cart/decrease", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ingredientId, userId: 1 }),
      });
    } catch (error) {
      console.error("Failed to remove ingredient:", error);
      setError("Failed to remove ingredient. Please try again later.");
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseCount,
        decreaseCount,
        addIngredient,
        removeIngredient,
        isLoading,
        error,
        allIngredients,
        updateTotalAmount
        
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};