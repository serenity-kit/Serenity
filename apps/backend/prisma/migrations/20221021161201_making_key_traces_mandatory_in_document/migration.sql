/*
  Warnings:

  - Made the column `contentKeyDerivationTrace` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nameKeyDerivationTrace` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "contentKeyDerivationTrace" SET NOT NULL,
ALTER COLUMN "contentKeyDerivationTrace" SET DEFAULT '{}',
ALTER COLUMN "nameKeyDerivationTrace" SET NOT NULL,
ALTER COLUMN "nameKeyDerivationTrace" SET DEFAULT '{}';
