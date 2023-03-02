/*
  Warnings:

  - Made the column `subkeyId` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nameCiphertext` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nameNonce` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "subkeyId" SET NOT NULL,
ALTER COLUMN "nameCiphertext" SET NOT NULL,
ALTER COLUMN "nameNonce" SET NOT NULL;
