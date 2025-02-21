import { hashSync } from 'bcrypt';
import { prisma } from './prisma-client';
import { banners, cards, categories, ingredients, products } from './constants';
import { Prisma } from '@prisma/client';

const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateProductItem = ({ productId, type, size }: { productId: number; type?: number; size?: number }) => {
  return {
    productId,
    price: randomNumber(190, 600),
    type,
    size,
  } as Prisma.ProductItemUncheckedCreateInput;
};

async function up() {
  console.log('Создание пользователей...');
  await prisma.user.createMany({
    data: [
      {
        fullName: 'User Test',
        email: 'user@test.ru',
        password: hashSync('111111', 10),
        verified: new Date(),
        role: 'USER',
      },
      {
        fullName: 'Admin Admin',
        email: 'admin@test.ru',
        password: hashSync('111111', 10),
        verified: new Date(),
        role: 'ADMIN',
      },
    ],
  });
  console.log('Пользователи созданы.');

  console.log('Создание категорий...');
  await prisma.category.createMany({
    data: categories,
  });
  console.log('Категории созданы.');

  console.log('Создание ингредиентов...');
  await prisma.ingredient.createMany({
    data: ingredients,
  });
  console.log('Ингредиенты созданы.');

  console.log('Создание продуктов...');
  await prisma.product.createMany({
    data: products,
  });
  console.log('Продукты созданы.');

  console.log('Создание card...');
  await prisma.card.createMany({
    data: cards,
  });
  console.log('card созданы.');

  console.log('Создание banner...');
  await prisma.banner.createMany({
    data: banners,
  });
  console.log('banner созданы.');

}

async function down() {
  console.log('Очистка таблиц...');
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ProductItem" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Ingredient" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
  console.log('Таблицы очищены.');
}

async function main() {
  try {
    await down();
    await up();
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Database seeded successfully');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });