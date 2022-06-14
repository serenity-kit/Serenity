/*
  Warnings:

  - Added the required column `confirmationCode` to the `UnconfirmedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnconfirmedUser" ADD COLUMN     "confirmationCode" TEXT NOT NULL;
