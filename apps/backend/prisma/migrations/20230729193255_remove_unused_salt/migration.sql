/*
  Warnings:

  - You are about to drop the column `mainDeviceEncryptionKeySalt` on the `UnverifiedUser` table. All the data in the column will be lost.
  - You are about to drop the column `pendingWorkspaceInvitationKeyEncryptionSalt` on the `UnverifiedUser` table. All the data in the column will be lost.
  - You are about to drop the column `mainDeviceEncryptionKeySalt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pendingWorkspaceInvitationKeyEncryptionSalt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UnverifiedUser" DROP COLUMN "mainDeviceEncryptionKeySalt",
DROP COLUMN "pendingWorkspaceInvitationKeyEncryptionSalt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mainDeviceEncryptionKeySalt",
DROP COLUMN "pendingWorkspaceInvitationKeyEncryptionSalt";
