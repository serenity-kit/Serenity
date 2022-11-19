/*
  Warnings:

  - A unique constraint covering the columns `[deviceSigningPublicKey]` on the table `DocumentShareLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceEncryptionPublicKey]` on the table `DocumentShareLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceEncryptionPublicKeySignature]` on the table `DocumentShareLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceEncryptionPublicKey` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceEncryptionPublicKeySignature` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceSigningPublicKey` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentShareLinkToken` to the `SnapshotKeyBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" ADD COLUMN     "deviceEncryptionPublicKey" TEXT NOT NULL,
ADD COLUMN     "deviceEncryptionPublicKeySignature" TEXT NOT NULL,
ADD COLUMN     "deviceSigningPublicKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SnapshotKeyBox" ADD COLUMN     "documentShareLinkToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceSigningPublicKey_key" ON "DocumentShareLink"("deviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceEncryptionPublicKey_key" ON "DocumentShareLink"("deviceEncryptionPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_deviceEncryptionPublicKeySignature_key" ON "DocumentShareLink"("deviceEncryptionPublicKeySignature");

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_documentShareLinkToken_fkey" FOREIGN KEY ("documentShareLinkToken") REFERENCES "DocumentShareLink"("token") ON DELETE CASCADE ON UPDATE CASCADE;
