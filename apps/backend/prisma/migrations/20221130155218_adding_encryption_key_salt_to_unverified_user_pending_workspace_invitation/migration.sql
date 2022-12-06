-- AlterTable
ALTER TABLE "UnverifiedUser" ADD COLUMN     "pendingWorkspaceInvitationKeyEncryptionSalt" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingWorkspaceInvitationKeyEncryptionSalt" TEXT;
