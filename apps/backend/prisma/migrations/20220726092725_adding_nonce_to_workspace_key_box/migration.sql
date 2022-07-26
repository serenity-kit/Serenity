/*
  Warnings:

  - Added the required column `nonce` to the `WorkspaceKeyBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceKeyBox" ADD COLUMN     "nonce" TEXT NOT NULL;
