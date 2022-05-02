/*
  Warnings:

  - You are about to drop the column `passwordResetTokenExpireDateTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordResetTokenExpireDateTime",
ADD COLUMN     "passwordResetOneTimePasswordExpireDateTime" TIMESTAMP(3);
