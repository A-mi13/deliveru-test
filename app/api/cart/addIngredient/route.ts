// \app\api\cart\addIngredient
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: Request) {
  const { productId, ingredientId, userId } = await request.json();

  if (!productId || !ingredientId || !userId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    // Проверяем, существует ли корзина для пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      // Если корзины нет, создаем новую
      cart = await prisma.cart.create({
        data: {
          userId,
          token: "", // Если необходимо, передавай значение для token
        },
      });
    }

    // Проверяем, существует ли продукт с указанным productId
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Проверяем, существует ли продуктItem для этого продукта
    const productItem = await prisma.productItem.findFirst({
      where: { productId: product.id },
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

    let cartItemId;

    if (existingCartItem) {
      // Если товар уже есть в корзине, просто используем его
      cartItemId = existingCartItem.id;
    } else {
      // Если товара нет в корзине, добавляем новый CartItem
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: productItem.id,
          quantity: 1, // по умолчанию добавляем 1
        },
      });
      cartItemId = newCartItem.id;
    }

    // Создаем связь между CartItem и Ingredient
    const cartItemIngredient = await prisma.cartItemIngredient.create({
      data: {
        cartItemId, // Идентификатор CartItem
        ingredientId, // Идентификатор ингредиента
        quantity: 1, // Количество ингредиента (можно изменить, если нужно)
      },
    });

    return NextResponse.json({ success: true, cartItemIngredient });
  } catch (error: any) {
    console.error("Error in /api/cart/addIngredient:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
