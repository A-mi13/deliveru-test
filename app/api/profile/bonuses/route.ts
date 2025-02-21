import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET() {
  // const { userId } = auth();

  const userId = "1"; // Ваш способ получения userId

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bonus = await prisma.bonus.findFirst({
    where: { userId: parseInt(userId) },
  });

  return NextResponse.json(bonus); // Отправляем один объект бонуса, а не массив
}
