import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { calculateTotalPrice } from "@/components/shared/priceCalculator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId")) || 1;
  const deliveryPrice = 50; // Пример стоимости доставки

  try {
    // Получаем корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: { include: { items: true } } }, // Включаем вариации продукта
            },
            ingredients: {
              include: { ingredient: true }, // Включаем ингредиенты
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], totalAmount: 0 });
    }

    // Формируем ответ для клиента
    const items = cart.items.map((item) => ({
      id: item.id,
      count: item.quantity,
      product: {
        id: item.productItem.product.id,
        name: item.productItem.product.name,
        price: item.productItem.price, // Цена вариации
        imageUrl: item.productItem.product.imageUrl,
        categoryId: item.productItem.product.categoryId,
        items: item.productItem.product.items, // Включаем вариации
      },
      productItem: item.productItem, // Включаем productItem
      ingredients: item.ingredients.map((ing) => ({
        id: ing.ingredient.id,
        name: ing.ingredient.name,
        price: ing.ingredient.price,
        imageUrl: ing.ingredient.imageUrl,
      })),
    }));

    // Рассчитываем общую стоимость товаров с учетом ингредиентов и вариаций
    const totalPrice = calculateTotalPrice({
      items: cart.items.map((item) => ({
        productItem: item.productItem,
        product: item.productItem.product,
        ingredients: item.ingredients.map((ing) => ({
          price: ing.ingredient.price,
        })),
        count: item.quantity,
      })),
    });

    // Добавляем стоимость доставки к итоговой сумме
    const totalAmount = totalPrice + deliveryPrice;

    // Обновляем поле totalAmount в корзине
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ items, totalAmount, deliveryPrice });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}