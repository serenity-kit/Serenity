/*
  Warnings:

  - Added the required column `invitationDataSignature` to the `WorkspaceInvitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitationSigningPublicKey` to the `WorkspaceInvitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceInvitations" ADD COLUMN     "invitationDataSignature" TEXT NOT NULL,
ADD COLUMN     "invitationSigningPublicKey" TEXT NOT NULL;
