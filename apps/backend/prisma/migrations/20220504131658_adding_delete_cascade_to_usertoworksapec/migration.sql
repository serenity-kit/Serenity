-- DropForeignKey
ALTER TABLE "UsersToWorkspaces" DROP CONSTRAINT "UsersToWorkspaces_username_fkey";

-- DropForeignKey
ALTER TABLE "UsersToWorkspaces" DROP CONSTRAINT "UsersToWorkspaces_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersToWorkspaces" ADD CONSTRAINT "UsersToWorkspaces_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
