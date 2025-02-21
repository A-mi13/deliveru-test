import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId")) || 1;
  const deliveryPrice = 50; // Пример стоимости доставки (можно получать из базы данных или внешнего API)

  try {
    // Получаем корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true },
            },
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], totalAmount: 0 });
    }

    // Рассчитываем общую стоимость товаров с учетом ингредиентов
    const totalPrice = cart.items.reduce((sum, item) => {
      const ingredientTotal = item.ingredients.reduce((acc, ing) => acc + ing.ingredient.price, 0);
      return sum + (item.quantity * item.productItem.product.price) + (ingredientTotal * item.quantity);
    }, 0);

    // Добавляем стоимость доставки к итоговой сумме
    const totalAmount = totalPrice + deliveryPrice;

    // Обновляем поле totalAmount в корзине
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    // Формируем ответ для клиента
    const items = cart.items.map((item) => ({
      id: item.productItem.product.id,
      count: item.quantity,
      product: {
        id: item.productItem.product.id,
        name: item.productItem.product.name,
        price: item.productItem.product.price,
        imageUrl: item.productItem.product.imageUrl,
        categoryId: item.productItem.product.categoryId,
      },
      ingredients: item.ingredients.map((ing) => ({
        id: ing.ingredient.id,
        name: ing.ingredient.name,
        price: ing.ingredient.price,
        imageUrl: ing.ingredient.imageUrl,
      })),
    }));

    return NextResponse.json({ items, totalAmount, deliveryPrice });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}