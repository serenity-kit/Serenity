/*
  Warnings:

  - You are about to drop the column `deviceSecretBoxCiphertext` on the `DocumentShareLink` table. All the data in the column will be lost.
  - You are about to drop the column `deviceSecretBoxNonce` on the `DocumentShareLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "deviceSecretBoxCiphertext",
DROP COLUMN "deviceSecretBoxNonce";
