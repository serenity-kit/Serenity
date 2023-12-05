/*
  Warnings:

  - A unique constraint covering the columns `[sessionToken]` on the table `LoginAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LoginAttempt" ADD COLUMN     "sessionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LoginAttempt_sessionToken_key" ON "LoginAttempt"("sessionToken");
