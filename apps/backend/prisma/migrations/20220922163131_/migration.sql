/*
  Warnings:

  - You are about to drop the `CreatorDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreatorDevice" DROP CONSTRAINT "CreatorDevice_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceKeyBox" DROP CONSTRAINT "WorkspaceKeyBox_creatorDeviceSigningPublicKey_fkey";

-- DropTable
DROP TABLE "CreatorDevice";
