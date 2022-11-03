/*
  Warnings:

  - You are about to drop the column `creatorDeviceSigningPublicKey` on the `DocumentShareLink` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentShareLink" DROP CONSTRAINT "DocumentShareLink_creatorDeviceSigningPublicKey_fkey";

-- AlterTable
ALTER TABLE "DocumentShareLink" DROP COLUMN "creatorDeviceSigningPublicKey";
