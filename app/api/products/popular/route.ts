// app/api/products/popular/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const popularProducts = await prisma.product.findMany({
      where: {
        isPopular: true,
      },
    });
    return NextResponse.json(popularProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Ошибка при загрузке популярных товаров" },
      { status: 500 }
    );
  }
}