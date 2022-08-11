/*
  Warnings:

  - You are about to drop the column `nameNonce` on the `Folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "nameNonce",
ADD COLUMN     "encryptedNameNonce" TEXT;
