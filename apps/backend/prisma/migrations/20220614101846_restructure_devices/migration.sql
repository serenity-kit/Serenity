/*
  Warnings:

  - A unique constraint covering the columns `[nonce]` on the table `RecoveryDevice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainDeviceNonce]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainDeviceSigningPublicKey]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webDeviceNonce]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webDeviceSigningPublicKey]` on the table `UnconfirmedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainDeviceNonce]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mainDeviceCiphertext` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainDeviceNonce` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainDeviceSigningPublicKey` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webDeviceCiphertext` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webDeviceNonce` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webDeviceSigningPublicKey` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.
  - Made the column `mainDeviceSigningPublicKey` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_mainDeviceSigningPublicKey_fkey";

-- AlterTable
ALTER TABLE "UnconfirmedUser" ADD COLUMN     "mainDeviceCiphertext" TEXT NOT NULL,
ADD COLUMN     "mainDeviceNonce" TEXT NOT NULL,
ADD COLUMN     "mainDeviceSigningPublicKey" TEXT NOT NULL,
ADD COLUMN     "webDeviceCiphertext" TEXT NOT NULL,
ADD COLUMN     "webDeviceNonce" TEXT NOT NULL,
ADD COLUMN     "webDeviceSigningPublicKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mainDeviceCiphertext" DROP DEFAULT,
ALTER COLUMN "mainDeviceNonce" DROP DEFAULT,
ALTER COLUMN "mainDeviceSigningPublicKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDevice_nonce_key" ON "RecoveryDevice"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_mainDeviceNonce_key" ON "UnconfirmedUser"("mainDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_mainDeviceSigningPublicKey_key" ON "UnconfirmedUser"("mainDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_webDeviceNonce_key" ON "UnconfirmedUser"("webDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "UnconfirmedUser_webDeviceSigningPublicKey_key" ON "UnconfirmedUser"("webDeviceSigningPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_mainDeviceNonce_key" ON "User"("mainDeviceNonce");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mainDeviceSigningPublicKey_fkey" FOREIGN KEY ("mainDeviceSigningPublicKey") REFERENCES "Device"("signingPublicKey") ON DELETE RESTRICT ON UPDATE CASCADE;
