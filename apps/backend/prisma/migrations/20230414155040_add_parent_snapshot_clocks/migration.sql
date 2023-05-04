/*
  Warnings:

  - Added the required column `parentSnapshotClocks` to the `Snapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "parentSnapshotClocks" JSONB NOT NULL;
