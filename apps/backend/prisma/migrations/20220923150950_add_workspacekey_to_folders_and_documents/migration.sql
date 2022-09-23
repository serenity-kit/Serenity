-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_workspaceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_workspaceKeyId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "workspaceKeyId" DROP NOT NULL,
ALTER COLUMN "workspaceKeyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "workspaceKeyId" DROP NOT NULL,
ALTER COLUMN "workspaceKeyId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
