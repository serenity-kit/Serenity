/*
  Warnings:

  - You are about to drop the column `deviceEncryptionPublicKey` on the `DocumentShareLink` table. All the data in the column will be lost.
  - You are about to drop the column `deviceEncryptionPublicKeySignature` on the `DocumentShareLink` table. All the data in the column will be lost.
  - You are about to drop the column `deviceSigningPublicKey` on the `DocumentShareLink` table. All the data in the column will be lost.
  - Added the required column `creatorDeviceSigningPublicKey` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "deviceEncryptionPublicKey",
DROP COLUMN "deviceEncryptionPublicKeySignature",
DROP COLUMN "deviceSigningPublicKey",
ADD COLUMN     "creatorDeviceSigningPublicKey" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentShareLink" ADD CONSTRAINT "DocumentShareLink_creatorDeviceSigningPublicKey_fkey" FOREIGN KEY ("creatorDeviceSigningPublicKey") REFERENCES "CreatorDevice"("signingPublicKey") ON DELETE SET DEFAULT ON UPDATE CASCADE;
