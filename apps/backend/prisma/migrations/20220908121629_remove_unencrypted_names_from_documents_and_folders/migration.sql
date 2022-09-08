/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Folder` table. All the data in the column will be lost.
  - Made the column `encryptedName` on table `Folder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `encryptedNameNonce` on table `Folder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subkeyId` on table `Folder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "name",
ALTER COLUMN "encryptedName" SET NOT NULL,
ALTER COLUMN "encryptedNameNonce" SET NOT NULL,
ALTER COLUMN "subkeyId" SET NOT NULL;
