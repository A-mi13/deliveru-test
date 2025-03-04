import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productItem = await prisma.productItem.findUnique({
      where: { id: Number(params.id) }, // Используем `Number()`
    });

    if (!productItem) {
      return NextResponse.json(
        { error: "Product item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(productItem);
  } catch (error) {
    console.error("Failed to fetch product item:", error);
    return NextResponse.json(
      { error: "Failed to fetch product item" },
      { status: 500 }
    );
  }
}