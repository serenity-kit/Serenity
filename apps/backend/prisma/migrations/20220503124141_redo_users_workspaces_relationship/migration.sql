/*
  Warnings:

  - You are about to drop the `_UserToWorkspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToWorkspace" DROP CONSTRAINT "_UserToWorkspace_B_fkey";

-- DropTable
DROP TABLE "_UserToWorkspace";

-- CreateTable
CREATE TABLE "UsersToWorkspaces" (
    "username" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,

    CONSTRAINT "UsersToWorkspaces_pkey" PRIMARY KEY ("username","workspaceId")
);

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
