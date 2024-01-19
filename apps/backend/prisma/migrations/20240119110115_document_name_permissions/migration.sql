/*
  Warnings:

  - Added the required column `nameSignature` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameWorkspaceMemberDevicesProofHash` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "nameSignature" TEXT NOT NULL,
ADD COLUMN     "nameWorkspaceMemberDevicesProofHash" TEXT NOT NULL;
