/*
  Warnings:

  - Made the column `workspaceId` on table `WorkspaceKey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkspaceKey" ALTER COLUMN "workspaceId" SET NOT NULL;
