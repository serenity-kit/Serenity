/*
  Warnings:

  - Added the required column `state` to the `WorkspaceChainEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceChainEntry" ADD COLUMN     "state" JSONB NOT NULL;
