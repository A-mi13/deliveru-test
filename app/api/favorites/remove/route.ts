// app/api/favorites/remove/route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId, productId } = await req.json();

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}