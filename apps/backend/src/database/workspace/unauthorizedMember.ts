import { prisma } from "../prisma";

type Params = {
  userId: string;
};
export async function unauthorizedMember({ userId }: Params) {
  // find the first workspace connected to the user with a unauthorized user
  const workspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      isAuthorizedMember: true, // make sure the user is an authorized member
      workspace: {
        usersToWorkspaces: {
          some: {
            isAuthorizedMember: false,
          },
        },
      },
    },
    select: { workspaceId: true },
  });
  if (workspace == null) return null;

  // get the unauthorized user
  const unauthorizedMember = await prisma.usersToWorkspaces.findFirstOrThrow({
    where: {
      workspaceId: workspace.workspaceId,
      isAuthorizedMember: false,
    },
    include: {
      user: {
        select: {
          mainDeviceSigningPublicKey: true,
        },
      },
    },
  });

  // get all the devices of the unauthorized user
  const devices = await prisma.device.findMany({
    where: { userId: unauthorizedMember.userId },
  });

  return {
    workspaceId: workspace.workspaceId,
    userId: unauthorizedMember.userId,
    userMainDeviceSigningPublicKey:
      unauthorizedMember.user.mainDeviceSigningPublicKey,
    devices,
  };
}
