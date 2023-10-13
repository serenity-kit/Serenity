/*
  Warnings:

  - You are about to drop the column `parentSnapshotClocks` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotVersion` on the `Update` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[snapshotId,pubKey,clock]` on the table `Update` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `parentSnapshotUpdateClocks` to the `Snapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clock` to the `Update` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Update_snapshotId_pubKey_snapshotVersion_key";

-- AlterTable
ALTER TABLE "Snapshot" DROP COLUMN "parentSnapshotClocks",
ADD COLUMN     "parentSnapshotUpdateClocks" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Update" DROP COLUMN "snapshotVersion",
ADD COLUMN     "clock" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Update_id_version_idx" ON "Update"("id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Update_snapshotId_pubKey_clock_key" ON "Update"("snapshotId", "pubKey", "clock");
