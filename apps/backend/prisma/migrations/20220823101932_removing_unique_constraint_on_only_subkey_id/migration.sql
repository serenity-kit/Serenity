/*
  Warnings:

  - A unique constraint covering the columns `[subkeyId,workspaceId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Document_subkeyId_key";

-- DropIndex
DROP INDEX "Folder_subkeyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Folder_subkeyId_workspaceId_key" ON "Folder"("subkeyId", "workspaceId");
