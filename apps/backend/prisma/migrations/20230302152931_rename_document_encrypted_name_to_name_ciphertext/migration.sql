/*
  Warnings:

  - You are about to drop the column `encryptedName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedNameNonce` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "encryptedName",
DROP COLUMN "encryptedNameNonce",
ADD COLUMN     "nameCiphertext" TEXT,
ADD COLUMN     "nameNonce" TEXT;
