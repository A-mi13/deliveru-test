// app/api/favorites/add/route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId, productId } = await req.json();

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}