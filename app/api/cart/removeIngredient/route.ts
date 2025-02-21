import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function DELETE(request: Request) {
  const { productId, ingredientId, userId } = await request.json();

  if (!productId || !ingredientId || !userId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    // Проверяем, существует ли корзина для пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Проверяем, существует ли продуктItem для этого продукта
    const productItem = await prisma.productItem.findFirst({
      where: { productId },
    });

    if (!productItem) {
      return NextResponse.json(
        { error: "ProductItem not found" },
        { status: 404 }
      );
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "CartItem not found" },
        { status: 404 }
      );
    }

    // Удаляем связь CartItemIngredient
    await prisma.cartItemIngredient.deleteMany({
      where: {
        cartItemId: existingCartItem.id,
        ingredientId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/cart/removeIngredient:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}