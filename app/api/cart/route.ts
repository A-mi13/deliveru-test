import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { calculateTotalPrice } from "@/components/shared/priceCalculator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId")) || 1;
  const deliveryPrice = 50;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: { include: { items: true } } },
            },
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], totalAmount: 0 });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      count: item.quantity,
      product: {
        id: item.productItem?.product.id || 0,
        name: item.productItem?.product.name || "",
        price: item.productItem?.price || 0,
        imageUrl: item.productItem?.product.imageUrl || "",
        categoryId: item.productItem?.product.categoryId || 0,
        items: item.productItem?.product.items || [],
      },
      productItem: item.productItem || null,
      ingredients: item.ingredients.map((ing) => ({
        id: ing.ingredient.id,
        name: ing.ingredient.name,
        price: ing.ingredient.price,
        imageUrl: ing.ingredient.imageUrl,
      })),
    }));

    const totalPrice = calculateTotalPrice({
      items: cart.items.map((item) => ({
        productItem: item.productItem || null,
        product: item.productItem?.product || null,
        ingredients: item.ingredients.map((ing) => ({
          price: ing.ingredient.price,
        })),
        count: item.quantity,
      })),
    });

    const totalAmount = totalPrice + deliveryPrice;

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount },
    });

    return NextResponse.json({ items, totalAmount, deliveryPrice });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}