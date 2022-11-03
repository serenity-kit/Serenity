/*
  Warnings:

  - You are about to drop the column `deviceSecretBoxCipherText` on the `DocumentShareLink` table. All the data in the column will be lost.
  - Added the required column `deviceSecretBoxCiphertext` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "deviceSecretBoxCipherText",
ADD COLUMN     "deviceSecretBoxCiphertext" TEXT NOT NULL;
