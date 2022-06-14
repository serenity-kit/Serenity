/*
  Warnings:

  - Added the required column `mainDeviceEncryptionKeySalt` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnconfirmedUser" ADD COLUMN     "mainDeviceEncryptionKeySalt" TEXT NOT NULL;
