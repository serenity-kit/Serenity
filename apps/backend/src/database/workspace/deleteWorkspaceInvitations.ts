import { Role } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  workspaceInvitationIds: string[];
  userId: string;
};

export async function deleteWorkspaceInvitations({
  workspaceInvitationIds,
  userId,
}: Params) {
  try {
    await prisma.$transaction(async (prisma) => {
      // TODO: delete usersToWorkspace?
      // can only delete workspace invitations where the user is the admin
      // 1. get the workspaces referenced by the invitation ids
      const workspaceInvitations = await prisma.workspaceInvitations.findMany({
        where: {
          id: {
            in: workspaceInvitationIds,
          },
        },
      });
      const requestedWorkspaceIds: string[] = [];
      workspaceInvitations.forEach((invitation) => {
        requestedWorkspaceIds.push(invitation.workspaceId);
      });
      // 2. get the relevant workspaces where the user is an admin
      const userWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          userId: userId,
          role: Role.ADMIN,
          workspaceId: {
            in: requestedWorkspaceIds,
          },
        },
      });
      let userWorkspaceIds: string[] = [];
      for (const userWorkspace of userWorkspaces) {
        userWorkspaceIds.push(userWorkspace.workspaceId);
      }
      // 3. delete workspace invitations where the workspace is in the list of workspaces
      await prisma.workspaceInvitations.deleteMany({
        where: {
          workspaceId: {
            in: userWorkspaceIds,
          },
          id: {
            in: workspaceInvitationIds,
          },
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    });
  } catch (error) {
    throw new Error("Invalid workspaceInvitationIds");
  }
}
