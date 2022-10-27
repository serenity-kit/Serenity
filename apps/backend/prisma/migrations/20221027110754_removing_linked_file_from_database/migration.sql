/*
  Warnings:

  - You are about to drop the `LinkedFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkedFile" DROP CONSTRAINT "LinkedFile_documentId_fkey";

-- DropForeignKey
ALTER TABLE "LinkedFile" DROP CONSTRAINT "LinkedFile_workspaceId_fkey";

-- DropTable
DROP TABLE "LinkedFile";
