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
    include: {
      items: true, // Убедитесь, что загружаются все вариации товара
    },
  });

  // Преобразуем данные, чтобы включить isPopular
  const formattedProducts = products.map((product) => ({
    ...product,
    isPopular: product.isPopular || false, // Добавляем isPopular, если его нет
  }));

  return NextResponse.json(formattedProducts);
}