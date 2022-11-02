/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `UsersToWorkspaces` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'COMMENTER', 'VIEWER');

-- AlterTable
ALTER TABLE "UsersToWorkspaces" DROP COLUMN "isAdmin",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'VIEWER';
