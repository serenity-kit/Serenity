import { formatWorkspace } from "../../types/workspace";
import { prisma } from "../prisma";

type Cursor = {
  id: string;
};

type Params = {
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
  deviceSigningPublicKey: string;
};
export async function getWorkspaces({
  userId,
  deviceSigningPublicKey,
  cursor,
  skip,
  take,
}: Params) {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      userId,
    },
  });
  const workspaces = await prisma.workspace.findMany({
    where: {
      id: {
        in: userToWorkspaces.map((u) => u.workspaceId),
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      createdAt: "asc",
    },
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
  });
  return workspaces.map((workspace) => {
    return formatWorkspace(workspace);
  });
}
