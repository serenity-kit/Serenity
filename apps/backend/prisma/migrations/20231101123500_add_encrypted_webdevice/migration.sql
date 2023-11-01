/*
  Warnings:

  - A unique constraint covering the columns `[webDeviceNonce]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webDeviceAccessToken]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "webDeviceAccessToken" TEXT,
ADD COLUMN     "webDeviceCiphertext" TEXT,
ADD COLUMN     "webDeviceNonce" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Device_webDeviceNonce_key" ON "Device"("webDeviceNonce");

-- CreateIndex
CREATE UNIQUE INDEX "Device_webDeviceAccessToken_key" ON "Device"("webDeviceAccessToken");
