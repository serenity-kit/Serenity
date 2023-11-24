-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "subkeyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CommentReply" ALTER COLUMN "subkeyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "subkeyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "subkeyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UnverifiedUser" ALTER COLUMN "pendingWorkspaceInvitationKeySubkeyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "pendingWorkspaceInvitationKeySubkeyId" SET DATA TYPE TEXT;
