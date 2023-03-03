/*
  Warnings:

  - Added the required column `role` to the `WorkspaceInvitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkspaceInvitations" ADD COLUMN     "role" "Role" NOT NULL;
