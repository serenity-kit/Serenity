-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "contentKeyDerivationTrace" JSONB,
ADD COLUMN     "nameKeyDerivationTrace" JSONB;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "keyDerivationTrace" JSONB;
