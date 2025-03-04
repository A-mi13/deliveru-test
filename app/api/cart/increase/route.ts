import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function PUT(request: Request) {
  try {
    const { productId, productItemId, userId } = await request.json();

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: productId or userId" },
        { status: 400 }
      );
    }

    // Находим корзину пользователя
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: true,
            ingredients: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Находим товар в корзине
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItemId || undefined,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Увеличиваем количество товара
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + 1 },
    });

    // Пересчитываем totalAmount
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            productItem: true,
            ingredients: {
              include: {
                ingredient: true, // Добавляем загрузку связанного объекта ingredient
              },
            },
          },
        },
      },
    });
    

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const totalPrice = updatedCart.items.reduce((sum, item) => {
      // Считаем сумму ингредиентов для одного товара
      const ingredientTotal = item.ingredients.reduce(
        (acc, ing) => acc + ing.ingredient.price * ing.quantity,
        0
      );
    
      // Добавляем стоимость товара с учетом ингредиентов, умноженную на количество
      return sum + item.quantity * (item.productItem.price + ingredientTotal);
    }, 0);

    const deliveryPrice = 50; // Пример стоимости доставки
    const totalAmount = totalPrice + deliveryPrice;

    // Обновляем totalAmount в базе
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true, totalAmount });
  } catch (error) {
    console.error("Failed to increase count:", error);
  
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
    return NextResponse.json(
      { error: "Failed to increase count", details: errorMessage },
      { status: 500 }
    );
  }
}