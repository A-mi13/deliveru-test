"use client";
import { ProductItem } from "@prisma/client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { calculateItemTotalPrice, calculateTotalPrice } from "./priceCalculator";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  items?: ProductItem[];
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
  productItem?: ProductItem;
  ingredients?: Ingredient[];
  totalPrice?: number;
}

interface CartContextProps {
  cart: Record<number, CartItem>;
  setCart: (cart: Record<number, CartItem>) => void;
  addToCart: (id: number, productItemId?: number) => void;
  increaseCount: (id: number, productItemId?: number) => void; 
  decreaseCount: (id: number, productItemId?: number) => void;
  addIngredient: (productId: number, ingredientId: number, productItemId?: number) => void;
  removeIngredient: (productId: number, ingredientId: number) => void;
  isLoading: boolean;
  error: string | null;
  allIngredients: Ingredient[];
  updateTotalAmount: (totalAmount: number) => Promise<void>;
  totalAmount: number;
  totalPrice: number; // Добавляем totalPrice
  deliveryPrice: number; // Добавляем deliveryPrice
  discount: number; // Добавляем discount
  freeShipping: boolean; // Добавляем freeShipping
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0); // Добавляем состояние для totalPrice
  const [deliveryPrice, setDeliveryPrice] = useState<number>(50); // Добавляем состояние для deliveryPrice
  const [discount, setDiscount] = useState<number>(0); // Добавляем состояние для discount
  const [freeShipping, setFreeShipping] = useState<boolean>(false); // Добавляем состояние для freeShipping

  const updateTotalPrice = useCallback((cart: Record<number, CartItem>) => {
    const calculatedTotalPrice = calculateTotalPrice(cart);
    setTotalPrice(calculatedTotalPrice);
  }, []);

  const fetchCartFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart?userId=1");
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
  
      const cartItems = data.items.reduce((acc: Record<number, CartItem>, item: any) => {
        if (!item.product) {
          console.warn("Пропущен item без product:", item);
          return acc;
        }
      
        acc[item.product.id] = {
          id: item.product.id,
          count: item.count,
          product: item.product,
          ingredients: item.ingredients || [],
          productItem: item.productItem || null,
          totalPrice: item.totalPrice || 0,
        };
        return acc;
      }, {});
      
  
      setCart(cartItems);
      updateTotalPrice(cartItems); // Обновляем totalPrice после загрузки корзины
  
      if (typeof data.totalAmount === "number") {
        setTotalAmount(data.totalAmount);
      } else {
        console.warn("totalAmount not found in response:", data);
      }

    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Failed to fetch cart. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [updateTotalPrice]);

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
        body: JSON.stringify({ userId: 1, totalAmount }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении totalAmount");
      }
    } catch (error) {
      console.error("Ошибка при обновлении totalAmount:", error);
      setError("Ошибка при обновлении корзины. Пожалуйста, попробуйте позже.");
    }
  }, []);

  // Обновляем totalPrice при изменении корзины
  const handleSetCart = useCallback((newCart: Record<number, CartItem>) => {
    setCart(newCart);
    updateTotalPrice(newCart); // Обновляем totalPrice
  }, [updateTotalPrice]);

  const addToCart = useCallback(async (id: number, productItemId?: number) => {
    try {
      const productResponse = await fetch(`/api/products/${id}`);
      if (!productResponse.ok) throw new Error("Failed to fetch product");
      const product = await productResponse.json();

      if (!product) throw new Error("Product not found");

      let productItem: ProductItem | undefined;
      if (productItemId) {
        const productItemResponse = await fetch(`/api/product-items/${productItemId}`);
        if (!productItemResponse.ok) throw new Error("Failed to fetch product item");
        productItem = await productItemResponse.json();
      }

      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: 1, userId: 1, productItemId }),
      });

      setCart((prev) => ({
        ...prev,
        [id]: prev[id]
          ? { ...prev[id], count: prev[id].count + 1 }
          : { id, count: 1, product, ingredients: [], productItem },
      }));
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setError("Failed to add to cart. Please try again later.");
    }
  }, []);

  const increaseCount = useCallback(async (id: number, productItemId?: number) => {
    try {
      const response = await fetch("/api/cart/increase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, productItemId, userId: 1 }),
      });
  
      if (!response.ok) {
        throw new Error("Ошибка при увеличении количества");
      }
  
      const data = await response.json();
  
      // Обновляем состояние корзины после успешного ответа
      setCart((prev) => {
        const updatedCart = { ...prev };
        if (updatedCart[id]) {
          updatedCart[id] = { ...updatedCart[id], count: updatedCart[id].count + 1 };
        }
  
        // Пересчитываем totalPrice на основе обновленного состояния корзины
        updateTotalPrice(updatedCart); // Используем updatedCart вместо cart
  
        return updatedCart;
      });
  
      // Обновляем totalAmount на клиенте
      if (data.totalAmount) {
        updateTotalAmount(data.totalAmount);
      }
    } catch (error) {
      console.error("Ошибка при увеличении количества:", error);
      setError("Ошибка при увеличении количества. Пожалуйста, попробуйте позже.");
    }
  }, [updateTotalAmount, updateTotalPrice]); // Убедитесь, что зависимости указаны правильно

  const decreaseCount = useCallback(async (productId: number, productItemId?: number) => {
    try {
      await fetch("/api/cart/decrease", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productItemId, userId: 1 }),
      });
  
      setCart((prevCart) => {
        const updatedCart = { ...prevCart };
  
        if (updatedCart[productId]) {
          if (updatedCart[productId].count > 1) {
            updatedCart[productId] = { ...updatedCart[productId], count: updatedCart[productId].count - 1 };
          } else {
            delete updatedCart[productId];
          }
        }
  
        // Пересчитываем totalPrice
        updateTotalPrice(updatedCart); // Добавьте эту строку
  
        // Пересчитываем totalAmount на основе обновленного корзины
        const totalPrice = calculateTotalPrice(updatedCart);
        const deliveryPrice = 50;
        const totalAmount = totalPrice + deliveryPrice;
  
        updateTotalAmount(totalAmount); // Обновляем сумму на сервере
  
        return updatedCart;
      });
    } catch (error) {
      console.error("Failed to decrease count:", error);
      setError("Failed to decrease count. Please try again later.");
    }
  }, [updateTotalAmount, updateTotalPrice]); // Добавьте updateTotalPrice в зависимости
  
  const addIngredient = useCallback(async (productId: number, ingredientId: number, productItemId?: number) => {
    try {
      const ingredient = allIngredients.find((ing) => ing.id === ingredientId);
      if (!ingredient) throw new Error("Ingredient not found");
  
      // Обновляем локальное состояние корзины
      setCart((prev) => {
        const updatedCart = { ...prev };
        const cartItem = updatedCart[productId];
  
        if (cartItem) {
          // Проверяем, есть ли уже такой ингредиент
          const isIngredientExists = cartItem.ingredients?.some((ing) => ing.id === ingredientId);
          if (!isIngredientExists) {
            // Если ингредиента нет, добавляем его
            cartItem.ingredients = [...(cartItem.ingredients || []), ingredient];
            cartItem.productItem = cartItem.productItem || (productItemId ? { id: productItemId } as ProductItem : undefined);
  
            // Пересчитываем totalPrice для товара
            const itemTotalPrice = calculateItemTotalPrice(cartItem);
            cartItem.totalPrice = itemTotalPrice;
          }
        }
  
        // Пересчитываем totalAmount для всей корзины
        const cartTotalPrice = calculateTotalPrice(updatedCart);
        const deliveryPrice = 50;
        const totalAmount = cartTotalPrice + deliveryPrice;
  
        // Обновляем totalAmount на сервере
        updateTotalAmount(totalAmount); // Вызываем updateTotalAmount здесь, внутри setCart
  
        return updatedCart;
      });
  
      // Отправляем запрос на добавление ингредиента на сервер
      const response = await fetch("/api/cart/addIngredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ingredientId, productItemId, userId: 1, price: ingredient.price }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add ingredient on the server");
      }
  
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      setError("Failed to add ingredient. Please try again later.");
    }
  }, [allIngredients, updateTotalAmount]);

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
        setCart: handleSetCart,
        addToCart,
        increaseCount,
        decreaseCount,
        addIngredient,
        removeIngredient,
        isLoading,
        error,
        allIngredients,
        updateTotalAmount,
        totalAmount,
        totalPrice, // Передаем totalPrice
        deliveryPrice, // Передаем deliveryPrice
        discount, // Передаем discount
        freeShipping, // Передаем freeShipping
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