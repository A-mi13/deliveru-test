import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: Request) {
  try {
    const { productId, quantity, userId, ingredients } = await request.json();

    console.log("Received data:", { productId, quantity, userId, ingredients });

    // Получаем корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true },
            },
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, token: "" },
        include: {
          items: {
            include: {
              productItem: { include: { product: true } },
              ingredients: { include: { ingredient: true } },
            },
          },
        },
      });
    }

    // Проверяем, существует ли продукт
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Получаем или создаем `productItem`
    let productItem = await prisma.productItem.findFirst({
      where: { productId: product.id },
    });

    if (!productItem) {
      productItem = await prisma.productItem.create({
        data: {
          productId: product.id,
          price: product.price,
          type: 0,
        },
      });
    }

    // Проверяем, есть ли товар в корзине
    let cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    if (cartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: productItem.id,
          quantity,
        },
      });
    }

    // Обновляем или добавляем ингредиенты
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        const { id: ingredientId, quantity: ingredientQuantity } = ingredient;

        const existingIngredient = await prisma.cartItemIngredient.findFirst({
          where: { cartItemId: cartItem.id, ingredientId },
        });

        if (existingIngredient) {
          await prisma.cartItemIngredient.update({
            where: { id: existingIngredient.id },
            data: { quantity: existingIngredient.quantity + ingredientQuantity },
          });
        } else {
          await prisma.cartItemIngredient.create({
            data: {
              cartItemId: cartItem.id,
              ingredientId,
              quantity: ingredientQuantity,
            },
          });
        }
      }
    }

    // Повторно загружаем обновленную корзину
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            productItem: { include: { product: true } },
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Пересчитываем `totalAmount`
    const totalPrice = updatedCart.items.reduce((sum, item) => {
      const ingredientTotal = item.ingredients.reduce((acc, ing) => acc + ing.ingredient.price * ing.quantity, 0);
      return sum + item.quantity * item.productItem.product.price + ingredientTotal;
    }, 0);

    const deliveryPrice = 50;
    const totalAmount = totalPrice + deliveryPrice;

    // Обновляем `totalAmount` в базе
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true, totalAmount });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
