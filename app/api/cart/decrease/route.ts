// app\api\cart\decrease

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function DELETE(request: Request) {
  try {
    const { productId, userId } = await request.json();

    // Проверяем, существует ли корзина для пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true },
            },
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Проверяем, существует ли продукт с указанным productId
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Проверяем, существует ли productItem для данного productId
    const productItem = await prisma.productItem.findFirst({
      where: { productId: product.id },
    });

    if (!productItem) {
      return NextResponse.json({ error: "ProductItem not found" }, { status: 404 });
    }

    // Проверяем, есть ли уже такой товар в корзине
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    if (!existingCartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Уменьшаем количество товара или удаляем его, если количество = 1
    if (existingCartItem.quantity > 1) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity - 1 },
      });
    } else {
      // Удаляем все связанные ингредиенты перед удалением cartItem
      await prisma.cartItemIngredient.deleteMany({
        where: { cartItemId: existingCartItem.id },
      });

      // Удаляем cartItem
      await prisma.cartItem.delete({
        where: { id: existingCartItem.id },
      });

      // Удаляем productItem, если он больше не используется в других корзинах
      const otherCartItems = await prisma.cartItem.findMany({
        where: { productItemId: productItem.id },
      });

      if (otherCartItems.length === 0) {
        await prisma.productItem.delete({
          where: { id: productItem.id },
        });
      }
    }

    // Получаем обновленные данные корзины
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true },
            },
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Пересчитываем totalAmount
    const totalPrice = updatedCart.items.reduce((sum, item) => {
      const ingredientTotal = item.ingredients.reduce((acc, ing) => acc + ing.ingredient.price * ing.quantity, 0);
      return sum + (item.quantity * item.productItem.product.price) + ingredientTotal;
    }, 0);

    const deliveryPrice = 50; // Пример стоимости доставки
    const totalAmount = totalPrice + deliveryPrice;

    // Обновляем поле totalAmount в корзине
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true, totalAmount });
  } catch (error) {
    console.error("Failed to decrease count:", error);
    return NextResponse.json(
      { error: "Failed to decrease count" },
      { status: 500 }
    );
  }
}