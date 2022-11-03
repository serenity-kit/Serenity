/*
  Warnings:

  - You are about to drop the column `deviceSecretBoxCipherText` on the `DocumentShareLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "deviceSecretBoxCipherText",
ADD COLUMN     "deviceSecretBoxCiphertext" TEXT NOT NULL DEFAULT 'invalid';
