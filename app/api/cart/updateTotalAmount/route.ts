// api/cart/updateTotalAmount/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(req: Request) {
  const { userId, totalAmount } = await req.json();

  try {
    // Находим корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!cart) {
      return NextResponse.json({ error: "Корзина не найдена" }, { status: 404 });
    }

    // Обновляем totalAmount
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при обновлении totalAmount:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении корзины" },
      { status: 500 }
    );
  }
}