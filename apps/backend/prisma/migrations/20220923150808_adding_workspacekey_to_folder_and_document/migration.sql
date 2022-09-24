-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "workspaceKeyId" TEXT NOT NULL DEFAULT 'invalid';

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "workspaceKeyId" TEXT NOT NULL DEFAULT 'invalid';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
