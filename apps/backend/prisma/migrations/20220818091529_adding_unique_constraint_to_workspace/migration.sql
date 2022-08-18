/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,subKeyId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_workspaceId_subKeyId_key" ON "Folder"("workspaceId", "subKeyId");
