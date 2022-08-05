/*
  Warnings:

  - You are about to drop the column `creatingDeviceSigningPublicKey` on the `WorkspaceKeyBox` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkspaceKeyBox" DROP COLUMN "creatingDeviceSigningPublicKey",
ADD COLUMN     "creatorDeviceSigningPublicKey" TEXT NOT NULL DEFAULT E'invalid';
