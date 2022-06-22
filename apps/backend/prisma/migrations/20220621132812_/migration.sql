/*
  Warnings:

  - You are about to drop the column `clientPublicKey` on the `UnverifiedUser` table. All the data in the column will be lost.
  - You are about to drop the column `clientPublicKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UnverifiedUser" DROP COLUMN "clientPublicKey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clientPublicKey";
