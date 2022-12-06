-- AlterTable
ALTER TABLE "UnverifiedUser" ADD COLUMN     "pendingWorkspaceInvitationKeyCiphertext" TEXT,
ADD COLUMN     "pendingWorkspaceInvitationKeyPublicNonce" TEXT,
ADD COLUMN     "pendingWorkspaceInvitationKeySubkeyId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingWorkspaceInvitationKeyCiphertext" TEXT,
ADD COLUMN     "pendingWorkspaceInvitationKeyPublicNonce" TEXT,
ADD COLUMN     "pendingWorkspaceInvitationKeySubkeyId" INTEGER;
