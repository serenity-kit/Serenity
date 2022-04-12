/*
  Warnings:

  - You are about to drop the column `cipherText` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `User` table. All the data in the column will be lost.
  - Added the required column `oprfCipherText` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oprfNonce` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "cipherText",
DROP COLUMN "nonce",
ADD COLUMN     "oprfCipherText" TEXT NOT NULL,
ADD COLUMN     "oprfNonce" TEXT NOT NULL;
