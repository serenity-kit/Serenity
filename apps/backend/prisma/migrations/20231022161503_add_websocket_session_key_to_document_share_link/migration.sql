/*
  Warnings:

  - A unique constraint covering the columns `[websocketSessionKey]` on the table `DocumentShareLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `websocketSessionKey` to the `DocumentShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentShareLink" ADD COLUMN     "websocketSessionKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShareLink_websocketSessionKey_key" ON "DocumentShareLink"("websocketSessionKey");
