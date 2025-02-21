/*
  Warnings:

  - You are about to drop the `_CartItemToIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_B_fkey";

-- DropTable
DROP TABLE "_CartItemToIngredient";

-- CreateTable
CREATE TABLE "CartItemIngredient" (
    "id" SERIAL NOT NULL,
    "cartItemId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartItemIngredient_cartItemId_ingredientId_key" ON "CartItemIngredient"("cartItemId", "ingredientId");

-- AddForeignKey
ALTER TABLE "CartItemIngredient" ADD CONSTRAINT "CartItemIngredient_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemIngredient" ADD CONSTRAINT "CartItemIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
