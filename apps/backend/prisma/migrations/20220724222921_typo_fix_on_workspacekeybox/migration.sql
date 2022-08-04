/*
  Warnings:

  - You are about to drop the column `cipherText` on the `WorkspaceKeyBox` table. All the data in the column will be lost.
  - Added the required column `ciphertext` to the `WorkspaceKeyBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceKeyBox" DROP COLUMN "cipherText",
ADD COLUMN     "ciphertext" TEXT NOT NULL;
