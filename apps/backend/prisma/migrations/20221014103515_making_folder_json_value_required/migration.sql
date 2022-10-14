/*
  Warnings:

  - Made the column `keyDerivationTrace` on table `Folder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "keyDerivationTrace" SET NOT NULL,
ALTER COLUMN "keyDerivationTrace" SET DEFAULT '{}';
