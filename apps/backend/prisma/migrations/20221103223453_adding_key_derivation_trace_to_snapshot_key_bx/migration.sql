-- AlterTable
ALTER TABLE "SnapshotKeyBox" ADD COLUMN     "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}';
