/*
  Warnings:

  - You are about to drop the column `snapshotKeyId` on the `SnapshotKeyBox` table. All the data in the column will be lost.
  - You are about to drop the `SnapshotKey` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `snapshotId` to the `SnapshotKeyBox` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SnapshotKey" DROP CONSTRAINT "SnapshotKey_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "SnapshotKeyBox" DROP CONSTRAINT "SnapshotKeyBox_snapshotKeyId_fkey";

-- AlterTable
ALTER TABLE "SnapshotKeyBox" DROP COLUMN "snapshotKeyId",
ADD COLUMN     "snapshotId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SnapshotKey";

-- AddForeignKey
ALTER TABLE "SnapshotKeyBox" ADD CONSTRAINT "SnapshotKeyBox_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
