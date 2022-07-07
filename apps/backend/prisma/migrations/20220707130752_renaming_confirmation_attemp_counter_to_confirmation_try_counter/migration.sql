/*
  Warnings:

  - You are about to drop the column `numConfirmationAttempts` on the `UnverifiedUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UnverifiedUser" DROP COLUMN "numConfirmationAttempts",
ADD COLUMN     "confirmationTryCounter" INTEGER NOT NULL DEFAULT 0;
