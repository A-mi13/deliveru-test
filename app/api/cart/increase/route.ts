// app\api\cart\increase
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function PUT(request: Request) {
  try {
    const { productId, userId } = await request.json();

    console.log("Received data:", { productId, userId });

    // Проверяем, существует ли корзина для пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    console.log("Cart found:", cart);

    // Если корзины нет, создаем новую
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          token: "", // Убедитесь, что поле token передается, если оно обязательно
        },
      });
      console.log("New cart created:", cart);
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

    // Создаем ProductItem на основе Product, если он еще не существует
    let productItem = await prisma.productItem.findFirst({
      where: {
        productId: product.id,
      },
    });

    if (!productItem) {
      productItem = await prisma.productItem.create({
        data: {
          productId: product.id,
          price: product.price, // Копируем цену из Product
          type: 0, // Значение по умолчанию для поля type
        },
      });
      console.log("New product item created:", productItem);
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    console.log("Existing cart item:", existingCartItem);

    if (existingCartItem) {
      // Если товар уже есть в корзине, увеличиваем его количество
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      // Если товара нет в корзине, добавляем его
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: productItem.id,
          quantity: 1, // Начальное количество
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increase count:", error);
    return NextResponse.json(
      { error: "Failed to increase count" },
      { status: 500 }
    );
  }
}