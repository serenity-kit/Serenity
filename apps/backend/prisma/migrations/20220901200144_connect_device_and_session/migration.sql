/*
  Warnings:

  - Made the column `info` on table `Device` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deviceSigningPublicKey` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "info" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "deviceSigningPublicKey" SET NOT NULL;
