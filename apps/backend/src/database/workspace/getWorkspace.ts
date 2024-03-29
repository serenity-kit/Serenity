import { ForbiddenError } from "apollo-server-express";
import { formatWorkspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  id: string;
  userId: string;
  deviceSigningPublicKey: string;
};
export async function getWorkspace({
  userId,
  id,
  deviceSigningPublicKey,
}: Params) {
  const userWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId: id,
    },
    select: { workspace: true },
  });
  if (!userWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // include userstoworkspaces but in descending alphabetical order by userId
  const rawWorkspace = await prisma.workspace.findUnique({
    include: {
      infoWorkspaceKey: {
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey },
            include: { creatorDevice: true },
          },
        },
      },
      workspaceKeys: {
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey },
            include: { creatorDevice: true },
          },
        },
        orderBy: {
          generation: "desc",
        },
      },
    },
    where: { id },
  });
  if (!rawWorkspace) {
    return null;
  }
  return formatWorkspace(rawWorkspace);
}
