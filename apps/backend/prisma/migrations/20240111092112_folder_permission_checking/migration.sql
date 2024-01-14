/*
  Warnings:

  - You are about to drop the column `idSignature` on the `Folder` table. All the data in the column will be lost.
  - Added the required column `signature` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceMemberDevicesProofHash` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "idSignature",
ADD COLUMN     "signature" TEXT NOT NULL,
ADD COLUMN     "workspaceMemberDevicesProofHash" TEXT NOT NULL;
