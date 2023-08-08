/*
  Warnings:

  - A unique constraint covering the columns `[sessionKey]` on the table `LoginAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LoginAttempt" ADD COLUMN     "sessionKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LoginAttempt_sessionKey_key" ON "LoginAttempt"("sessionKey");
