-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "keyDerivationTrace" JSONB NOT NULL DEFAULT '{}';
