/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_id_key" ON "Folder"("id");
