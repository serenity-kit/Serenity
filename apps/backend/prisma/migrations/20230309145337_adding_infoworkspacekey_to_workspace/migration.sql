/*
  Warnings:

  - A unique constraint covering the columns `[infoWorkspaceKeyId]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "infoCiphertext" TEXT,
ADD COLUMN     "infoNonce" TEXT,
ADD COLUMN     "infoWorkspaceKeyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_infoWorkspaceKeyId_key" ON "Workspace"("infoWorkspaceKeyId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_infoWorkspaceKeyId_fkey" FOREIGN KEY ("infoWorkspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
