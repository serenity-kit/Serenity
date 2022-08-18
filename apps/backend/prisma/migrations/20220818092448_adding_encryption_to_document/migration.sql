/*
  Warnings:

  - A unique constraint covering the columns `[subkeyId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subkeyId,workspaceId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "encryptedName" TEXT,
ADD COLUMN     "encryptedNameNonce" TEXT,
ADD COLUMN     "subkeyId" INTEGER,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Document_subkeyId_key" ON "Document"("subkeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_subkeyId_workspaceId_key" ON "Document"("subkeyId", "workspaceId");
