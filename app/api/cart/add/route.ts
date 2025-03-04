import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: Request) {
  try {
    const { productId, productItemId, quantity, userId, ingredients } = await request.json();

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: { include: { product: true } },
            ingredients: { include: { ingredient: true } },
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

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let productItem = await prisma.productItem.findFirst({
      where: { productId: product.id, id: productItemId },
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

    const totalPrice = updatedCart.items.reduce((sum, item) => {
      const ingredientTotal = item.ingredients.reduce(
        (acc, ing) => acc + ing.ingredient.price * ing.quantity,
        0
      );
      return sum + item.quantity * item.productItem.price + ingredientTotal;
    }, 0);

    const deliveryPrice = 50;
    const totalAmount = totalPrice + deliveryPrice;

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ success: true, totalAmount, cart: updatedCart });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}