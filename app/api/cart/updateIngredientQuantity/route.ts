import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function PUT(request: Request) {
  const { productId, ingredientId, userId, quantity } = await request.json();

  if (!productId || !ingredientId || !userId || quantity === undefined) {
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

    // Проверяем, существует ли связь CartItemIngredient
    const existingCartItemIngredient = await prisma.cartItemIngredient.findFirst({
      where: {
        cartItemId: existingCartItem.id,
        ingredientId,
      },
    });

    if (!existingCartItemIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found in cart" },
        { status: 404 }
      );
    }

    // Обновляем количество ингредиента
    const updatedCartItemIngredient = await prisma.cartItemIngredient.update({
      where: { id: existingCartItemIngredient.id },
      data: { quantity },
    });

    return NextResponse.json({ success: true, cartItemIngredient: updatedCartItemIngredient });
  } catch (error: any) { // Приводим ошибку к типу any
    console.error("Error in /api/cart/updateIngredientQuantity:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
