/*
  Warnings:

  - You are about to drop the column `webDeviceCiphertext` on the `UnconfirmedUser` table. All the data in the column will be lost.
  - You are about to drop the column `webDeviceNonce` on the `UnconfirmedUser` table. All the data in the column will be lost.
  - You are about to drop the column `webDeviceSigningPublicKey` on the `UnconfirmedUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UnconfirmedUser_username_key";

-- DropIndex
DROP INDEX "UnconfirmedUser_webDeviceNonce_key";

-- DropIndex
DROP INDEX "UnconfirmedUser_webDeviceSigningPublicKey_key";

-- AlterTable
ALTER TABLE "UnconfirmedUser" DROP COLUMN "webDeviceCiphertext",
DROP COLUMN "webDeviceNonce",
DROP COLUMN "webDeviceSigningPublicKey";
