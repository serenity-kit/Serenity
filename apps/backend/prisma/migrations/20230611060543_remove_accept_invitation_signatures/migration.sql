/*
  Warnings:

  - You are about to drop the column `acceptInvitationAuthorSignature` on the `UsersToWorkspaces` table. All the data in the column will be lost.
  - You are about to drop the column `acceptInvitationSignature` on the `UsersToWorkspaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UsersToWorkspaces" DROP COLUMN "acceptInvitationAuthorSignature",
DROP COLUMN "acceptInvitationSignature";
