/*
  Warnings:

  - A unique constraint covering the columns `[subKeyId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_subKeyId_key" ON "Folder"("subKeyId");
