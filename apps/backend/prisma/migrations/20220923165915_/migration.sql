-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "workspaceKeyId" TEXT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
