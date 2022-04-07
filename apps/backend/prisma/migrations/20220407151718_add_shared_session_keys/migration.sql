/*
  Warnings:

  - You are about to drop the column `sessionPrivateKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "sessionPrivateKey",
ADD COLUMN     "sharedRx" TEXT,
ADD COLUMN     "sharedTx" TEXT;
