// priceCalculator.ts

/**
 * Рассчитывает стоимость одного товара с учетом вариации и ингредиентов.
 * @param item - Элемент корзины.
 * @returns Общая стоимость для данного товара.
 */
export const calculateItemTotalPrice = (item: {
  productItem?: { price: number };
  product?: { price: number };
  ingredients?: { price: number }[];
  count: number;
}): number => {
  const productPrice = item.productItem?.price ?? item.product?.price ?? 0;
  const ingredientTotal = (item.ingredients ?? []).reduce(
    (sum, ing) => sum + (ing.price ?? 0),
    0
  );
  return item.count * (productPrice + ingredientTotal);
};

/**
 * Рассчитывает общую стоимость корзины.
 * @param cart - Корзина (объект с элементами).
 * @returns Общая стоимость корзины.
 */
export const calculateTotalPrice = (
  cart: Record<number, {
    productItem?: { price: number };
    product?: { price: number };
    ingredients?: { price: number }[];
    count: number;
  }> | {
    items: {
      productItem?: { price: number };
      product?: { price: number };
      ingredients?: { price: number }[];
      count: number;
    }[];
  }
): number => {
  const items = "items" in cart ? cart.items : Object.values(cart);

  return items.reduce((sum, item) => {
    const productPrice = item.productItem?.price ?? item.product?.price ?? 0;
    const ingredientTotal = (item.ingredients ?? []).reduce(
      (acc, ing) => acc + (ing.price ?? 0),
      0
    );
    return sum + item.count * (productPrice + ingredientTotal);
  }, 0);
};

/**
 * Рассчитывает итоговую стоимость с учетом доставки и скидки.
 * @param totalPrice - Общая стоимость товаров.
 * @param deliveryPrice - Стоимость доставки.
 * @param discount - Скидка.
 * @param freeShipping - Бесплатная доставка.
 * @returns Итоговая стоимость.
 */
export const calculateFinalPrice = (
  totalPrice: number,
  deliveryPrice: number,
  discount: number,
  freeShipping: boolean
): number => {
  const deliveryCost = freeShipping ? 0 : deliveryPrice;
  return Math.max(0, totalPrice + deliveryCost - discount);
};