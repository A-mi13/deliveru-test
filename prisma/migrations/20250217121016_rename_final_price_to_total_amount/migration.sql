/*
  Warnings:

  - You are about to drop the column `finalPrice` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "finalPrice",
ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;
