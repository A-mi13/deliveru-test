/*
  Warnings:

  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "_CartItemToIngredient" ADD CONSTRAINT "_CartItemToIngredient_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CartItemToIngredient_AB_unique";

-- AlterTable
ALTER TABLE "_IngredientToProduct" ADD CONSTRAINT "_IngredientToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_IngredientToProduct_AB_unique";
