/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "totalAmount",
ADD COLUMN     "finalPrice" INTEGER NOT NULL DEFAULT 0;
