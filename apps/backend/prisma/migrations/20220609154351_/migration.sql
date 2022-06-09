/*
  Warnings:

  - You are about to drop the column `signatureForMasterDeviceSigningPublicKey` on the `RecoveryDevice` table. All the data in the column will be lost.
  - You are about to drop the column `masterDeviceCiphertext` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `masterDeviceNonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `masterDeviceSigningPublicKey` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mainDeviceSigningPublicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signatureForMainDeviceSigningPublicKey` to the `RecoveryDevice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_masterDeviceSigningPublicKey_fkey";

-- DropIndex
DROP INDEX "User_masterDeviceSigningPublicKey_key";

-- AlterTable
ALTER TABLE "RecoveryDevice" DROP COLUMN "signatureForMasterDeviceSigningPublicKey",
ADD COLUMN     "signatureForMainDeviceSigningPublicKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "masterDeviceCiphertext",
DROP COLUMN "masterDeviceNonce",
DROP COLUMN "masterDeviceSigningPublicKey",
ADD COLUMN     "mainDeviceCiphertext" TEXT NOT NULL DEFAULT E'invalid',
ADD COLUMN     "mainDeviceNonce" TEXT NOT NULL DEFAULT E'invalid',
ADD COLUMN     "mainDeviceSigningPublicKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mainDeviceSigningPublicKey_key" ON "User"("mainDeviceSigningPublicKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mainDeviceSigningPublicKey_fkey" FOREIGN KEY ("mainDeviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE SET NULL ON UPDATE CASCADE;
