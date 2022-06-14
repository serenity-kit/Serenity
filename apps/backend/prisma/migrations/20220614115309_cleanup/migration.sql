/*
  Warnings:

  - You are about to drop the column `encryptionKeyType` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `signingKeyType` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `deviceSigningKeyType` on the `RecoveryDevice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mainDeviceEncryptionPublicKey]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainDeviceEncryptionPublicKeySignature]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mainDeviceEncryptionPublicKey` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainDeviceEncryptionPublicKeySignature` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "encryptionKeyType",
DROP COLUMN "signingKeyType";

-- AlterTable
ALTER TABLE "RecoveryDevice" DROP COLUMN "deviceSigningKeyType";

-- AlterTable
ALTER TABLE "UnconfirmedUser" ADD COLUMN     "mainDeviceEncryptionPublicKey" TEXT NOT NULL,
ADD COLUMN     "mainDeviceEncryptionPublicKeySignature" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_mainDeviceEncryptionPublicKey_key" ON "UnconfirmedUser"("mainDeviceEncryptionPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_mainDeviceEncryptionPublicKeySignature_key" ON "UnconfirmedUser"("mainDeviceEncryptionPublicKeySignature");
