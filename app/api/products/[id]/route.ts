import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const productId = Number(params.id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        items: true, // Включаем вариации продукта
        ingredients: true, // Включаем ингредиенты
        category: true, // Включаем категорию
        favorites: true, // Включаем избранное
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const productItemId = Number(params.id); // Меняем на productItemId

  if (isNaN(productItemId)) {
    return NextResponse.json({ error: "Invalid product item ID" }, { status: 400 });
  }

  try {
    const productItem = await prisma.productItem.findUnique({
      where: { id: productItemId },
    });

    if (!productItem) {
      return NextResponse.json({ error: "Product item not found" }, { status: 404 });
    }

    // Получаем корзину пользователя (если она есть, иначе создаем)
    const cart = await prisma.cart.upsert({
      where: { userId: 1 }, // Нужно подставить реальный userId
      update: {},
      create: { userId: 1 }, // Нужно подставить реальный userId
    });

    // Добавляем товар в корзину
    const cartItem = await prisma.cartItem.create({
      data: {
        productItem: { connect: { id: productItemId } }, // Подключаем товар
        cart: { connect: { id: cart.id } }, // Подключаем к корзине
        quantity: 1,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Failed to add product item to cart:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to add product item to cart" },
      { status: 500 }
    );
  }
}