/*
  Warnings:

  - You are about to drop the column `contentSubkeyId` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "contentSubkeyId";

-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "subkeyId" INTEGER;
