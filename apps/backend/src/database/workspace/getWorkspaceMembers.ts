import { ForbiddenError } from "apollo-server-express";
import { formatWorkspaceMember } from "../../types/workspace";
import { prisma } from "../prisma";

type Cursor = {
  userId?: string;
};

type Params = {
  userId: string;
  workspaceId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getWorkspaceMembers({
  userId,
  workspaceId,
  cursor,
  skip,
  take,
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
      usersToWorkspaces: {
        some: {
          workspaceId,
          isAuthorizedMember: true,
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

      mainDeviceSigningPublicKey: true, // TODO remove
      // TODO remove
      devices: {
        select: {
          signingPublicKey: true,
          encryptionPublicKey: true,
          encryptionPublicKeySignature: true,
        },
      },
    },
  });

  return users.map((user) => {
    return formatWorkspaceMember(user, workspaceId);
  });
}
