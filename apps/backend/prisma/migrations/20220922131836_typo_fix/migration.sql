/*
  Warnings:

  - Made the column `nonce` on table `WorkspaceKeyBox` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CreatorDevice" DROP CONSTRAINT "CreatorDevice_userId_fkey";

-- AlterTable
ALTER TABLE "WorkspaceKeyBox" ALTER COLUMN "nonce" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CreatorDevice" ADD CONSTRAINT "CreatorDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
