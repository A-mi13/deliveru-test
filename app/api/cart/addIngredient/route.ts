// \app\api\cart\addIngredient
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: Request) {
  const { productId, ingredientId, userId, productItemId } = await request.json();

  if (!productId || !ingredientId || !userId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          token: "",
        },
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Если productItemId передан, используем его, иначе ищем первую вариацию
    const productItem = productItemId
      ? await prisma.productItem.findUnique({
          where: { id: productItemId },
        })
      : await prisma.productItem.findFirst({
          where: { productId: product.id },
        });

    if (!productItem) {
      return NextResponse.json(
        { error: "ProductItem not found" },
        { status: 404 }
      );
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    let cartItemId;

    if (existingCartItem) {
      cartItemId = existingCartItem.id;
    } else {
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: productItem.id,
          quantity: 1,
        },
      });
      cartItemId = newCartItem.id;
    }

    const cartItemIngredient = await prisma.cartItemIngredient.create({
      data: {
        cartItemId,
        ingredientId,
        quantity: 1,
      },
    });

    return NextResponse.json({ success: true, cartItemIngredient });
  } catch (error: any) {
    console.error("Error in /api/cart/addIngredient:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}