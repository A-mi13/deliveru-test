const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllProductItems() {
  // Удаляем все записи из CartItemIngredient, чтобы удалить связи между CartItem и Ingredient
  await prisma.cartItemIngredient.deleteMany();

  // Удаляем все записи из CartItem
  await prisma.cartItem.deleteMany();

  // Удаляем все записи из ProductItem
  await prisma.productItem.deleteMany();

  console.log('Все записи из таблиц ProductItem, CartItem и CartItemIngredient удалены.');
}

deleteAllProductItems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
