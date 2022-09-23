/*
  Warnings:

  - Made the column `workspaceKeyId` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspaceKeyId` on table `Folder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_workspaceKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_workspaceKeyId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "workspaceKeyId" SET NOT NULL,
ALTER COLUMN "workspaceKeyId" SET DEFAULT 'invalid';

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "workspaceKeyId" SET NOT NULL,
ALTER COLUMN "workspaceKeyId" SET DEFAULT 'invalid';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceKeyId_fkey" FOREIGN KEY ("workspaceKeyId") REFERENCES "WorkspaceKey"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
