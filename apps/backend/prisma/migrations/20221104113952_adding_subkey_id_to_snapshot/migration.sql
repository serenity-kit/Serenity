/*
  Warnings:

  - You are about to drop the column `keyDerivationTrace` on the `SnapshotKeyBox` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subkeyId,documentId]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "subkeyId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SnapshotKeyBox" DROP COLUMN "keyDerivationTrace";

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_subkeyId_documentId_key" ON "Snapshot"("subkeyId", "documentId");
