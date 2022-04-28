/*
  Warnings:

  - A unique constraint covering the columns `[masterDeviceSigningPublicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `masterDeviceCiphertext` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `masterDeviceNonce` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `masterDeviceSigningPublicKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "masterDeviceCiphertext" TEXT NOT NULL,
ADD COLUMN     "masterDeviceNonce" TEXT NOT NULL,
ADD COLUMN     "masterDeviceSigningPublicKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RecoveryDevice" (
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "deviceSigningPublicKey" TEXT NOT NULL,
    "userUsername" TEXT NOT NULL,
    "signatureForMasterDeviceSigningPublicKey" TEXT NOT NULL,
    "signatureForRecoveryDeviceSigningPublicKey" TEXT NOT NULL,

    CONSTRAINT "RecoveryDevice_pkey" PRIMARY KEY ("deviceSigningPublicKey")
);

-- CreateTable
CREATE TABLE "Device" (
    "signingPublicKey" TEXT NOT NULL,
    "encryptionPublicKey" TEXT NOT NULL,
    "encryptionPublicKeySignature" TEXT NOT NULL,
    "username" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("signingPublicKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDevice_userUsername_key" ON "RecoveryDevice"("userUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Device_signingPublicKey_key" ON "Device"("signingPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_masterDeviceSigningPublicKey_key" ON "User"("masterDeviceSigningPublicKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_masterDeviceSigningPublicKey_fkey" FOREIGN KEY ("masterDeviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_userUsername_fkey" FOREIGN KEY ("userUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDevice" ADD CONSTRAINT "RecoveryDevice_deviceSigningPublicKey_fkey" FOREIGN KEY ("deviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
