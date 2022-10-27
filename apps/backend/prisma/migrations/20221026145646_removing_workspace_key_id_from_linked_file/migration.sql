/*
  Warnings:

  - You are about to drop the column `workspaceKeyId` on the `LinkedFile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkedFile" DROP CONSTRAINT "LinkedFile_workspaceKeyId_fkey";

-- AlterTable
ALTER TABLE "LinkedFile" DROP COLUMN "workspaceKeyId";
