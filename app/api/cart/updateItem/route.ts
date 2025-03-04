import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function PUT(request: Request) {
  const { productId, productItemId, userId } = await request.json();

  try {
    // Находим корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ message: "Корзина не найдена" }, { status: 404 });
    }

    // Находим элемент корзины
    const cartItem = cart.items.find((item) => item.productItemId === productId);

    if (!cartItem) {
      return NextResponse.json({ message: "Товар не найден в корзине" }, { status: 404 });
    }

    // Обновляем вариацию продукта
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { productItemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при обновлении вариации:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
