/*
  Warnings:

  - You are about to drop the column `encryptedName` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedNameNonce` on the `Folder` table. All the data in the column will be lost.
  - Added the required column `nameCiphertext` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameNonce` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "encryptedName",
DROP COLUMN "encryptedNameNonce",
ADD COLUMN     "nameCiphertext" TEXT NOT NULL,
ADD COLUMN     "nameNonce" TEXT NOT NULL;
