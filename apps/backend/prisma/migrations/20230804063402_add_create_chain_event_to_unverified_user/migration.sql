/*
  Warnings:

  - Added the required column `createChainEvent` to the `UnverifiedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnverifiedUser" ADD COLUMN     "createChainEvent" JSONB NOT NULL;
