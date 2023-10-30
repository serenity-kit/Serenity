/*
  Warnings:

  - You are about to drop the column `idSignature` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Workspace` table. All the data in the column will be lost.
  - Made the column `infoCiphertext` on table `Workspace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `infoNonce` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "idSignature",
DROP COLUMN "name",
ALTER COLUMN "infoCiphertext" SET NOT NULL,
ALTER COLUMN "infoNonce" SET NOT NULL;
