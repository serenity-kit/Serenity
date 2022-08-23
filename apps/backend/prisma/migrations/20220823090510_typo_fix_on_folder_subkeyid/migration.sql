/*
  Warnings:

  - You are about to drop the column `subKeyId` on the `Folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subkeyId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Folder_subKeyId_key";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "subKeyId",
ADD COLUMN     "subkeyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_subkeyId_key" ON "Folder"("subkeyId");
