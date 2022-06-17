/*
  Warnings:

  - You are about to drop the `UnconfirmedUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "UnconfirmedUser";

-- CreateTable
CREATE TABLE "UnverifiedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "clientPublicKey" TEXT NOT NULL,
    "opaqueEnvelope" TEXT NOT NULL,
    "passwordResetOneTimePassword" TEXT,
    "passwordResetOneTimePasswordExpireDateTime" TIMESTAMP(3),
    "confirmationCode" TEXT NOT NULL,
    "mainDeviceNonce" TEXT NOT NULL,
    "mainDeviceCiphertext" TEXT NOT NULL,
    "mainDeviceEncryptionKeySalt" TEXT NOT NULL,
    "mainDeviceSigningPublicKey" TEXT NOT NULL,
    "mainDeviceEncryptionPublicKey" TEXT NOT NULL,
    "mainDeviceEncryptionPublicKeySignature" TEXT NOT NULL,

    CONSTRAINT "UnverifiedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceNonce_key" ON "UnverifiedUser"("mainDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceSigningPublicKey_key" ON "UnverifiedUser"("mainDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceEncryptionPublicKey_key" ON "UnverifiedUser"("mainDeviceEncryptionPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnverifiedUser_mainDeviceEncryptionPublicKeySignature_key" ON "UnverifiedUser"("mainDeviceEncryptionPublicKeySignature");
