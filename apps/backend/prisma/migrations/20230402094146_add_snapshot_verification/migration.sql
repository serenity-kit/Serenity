/*
  Warnings:

  - Added the required column `parentSnapshotProof` to the `Snapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "parentSnapshotProof" TEXT NOT NULL;
