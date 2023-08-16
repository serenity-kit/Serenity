import { ForbiddenError } from "apollo-server-express";
import { formatWorkspaceMember } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  workspaceId: string;
  mainDeviceSigningPublicKeys: string[];
};
export async function getWorkspaceMembersByMainDeviceSigningPublicKey({
  userId,
  workspaceId,
  mainDeviceSigningPublicKeys,
}: Params) {
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }

  const users = await prisma.user.findMany({
    where: {
      mainDeviceSigningPublicKey: { in: mainDeviceSigningPublicKeys },
      usersToWorkspaces: {
        some: {
          workspaceId,
          // no need to check for isAuthorizedMember as we need them also to authorize the user
        },
      },
    },
    select: {
      id: true,
      username: true,
      chain: {
        orderBy: {
          position: "asc",
        },
        select: {
          position: true,
          content: true,
        },
      },
    },
  });

  return users.map((user) => {
    return formatWorkspaceMember(user, workspaceId);
  });
}
