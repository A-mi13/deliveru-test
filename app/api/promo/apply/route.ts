import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(req: Request) {
  const { promoCode, totalAmount } = await req.json();

  // Находим промокод в базе данных
  const promo = await prisma.promoCode.findUnique({
    where: { code: promoCode },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json(
      { error: "Промокод не найден или неактивен" },
      { status: 404 }
    );
  }

  // Проверяем срок действия промокода
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "Срок действия промокода истек" },
      { status: 400 }
    );
  }

  // Проверяем минимальную сумму заказа
  if (promo.minOrderAmount && totalAmount < promo.minOrderAmount) {
    return NextResponse.json(
      { error: `Минимальная сумма заказа для промокода: ${promo.minOrderAmount} ₽` },
      { status: 400 }
    );
  }

  // Проверяем максимальное количество использований
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return NextResponse.json(
      { error: "Промокод больше недействителен" },
      { status: 400 }
    );
  }

  // Рассчитываем скидку
  let discount = 0;
  if (promo.discountType === "PERCENT") {
    discount = Math.round((totalAmount * promo.discountValue) / 100);
  } else if (promo.discountType === "FIXED") {
    discount = promo.discountValue;
  }

  // Возвращаем успешный ответ с суммой скидки
  return NextResponse.json({ discount });
}