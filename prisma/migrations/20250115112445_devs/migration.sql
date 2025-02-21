/*
  Warnings:

  - You are about to drop the column `qantity` on the `CartItem` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "qantity",
ADD COLUMN     "quantity" INTEGER NOT NULL;
