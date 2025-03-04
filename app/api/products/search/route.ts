import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') || '';

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: query ? 5 : undefined,
    select: {
      items: true, 
      isPopular: true,// Убедитесь, что загружаются все вариации товара
    },
  });

  return NextResponse.json(products);
}
