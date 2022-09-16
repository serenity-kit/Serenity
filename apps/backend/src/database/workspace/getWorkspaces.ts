import { CreatorDevice } from "../../types/device";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
  WorkspaceMember,
} from "../../types/workspace";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
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
  const rawWorkspaces = await prisma.workspace.findMany({
    where: {
      id: {
        in: userToWorkspaces.map((u) => u.workspaceId),
      },
    },
    cursor,
    skip,
    take,
    orderBy: {
      name: "asc",
    },
    include: {
      usersToWorkspaces: {
        orderBy: {
          userId: "asc",
        },
        select: {
          userId: true,
          isAdmin: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      workspaceKey: {
        include: {
          workspaceKeyBoxes: {
            where: {
              deviceSigningPublicKey,
            },
          },
        },
        orderBy: {
          generation: "desc",
        },
      },
    },
  });
  // attach the .usersToWorkspaces as .members property
  // these lines convert the prisma types to the graphql types
  const creatorDeviceSigningPublicKeys: string[] = [];
  rawWorkspaces.forEach((rawWorkspace) => {
    rawWorkspace.workspaceKey.forEach((workspaceKey) => {
      workspaceKey.workspaceKeyBoxes.forEach((workspaceKeyBox) => {
        creatorDeviceSigningPublicKeys.push(
          workspaceKeyBox.creatorDeviceSigningPublicKey
        );
      });
    });
  });
  const creatorDevices = await prisma.device.findMany({
    where: { signingPublicKey: { in: creatorDeviceSigningPublicKeys } },
  });
  const creatorDeviceLookup: { [signingPublicKey: string]: CreatorDevice } = {};
  creatorDevices.forEach((device) => {
    creatorDeviceLookup[device.signingPublicKey] = device;
  });

  const workspaces: Workspace[] = [];
  rawWorkspaces.forEach((rawWorkspace) => {
    const members: WorkspaceMember[] = [];
    rawWorkspace.usersToWorkspaces.forEach((userToWorkspace) => {
      members.push({
        userId: userToWorkspace.userId,
        username: userToWorkspace.user.username,
        isAdmin: userToWorkspace.isAdmin,
      });
    });
    const currentWorkspaceKey: WorkspaceKey = rawWorkspace.workspaceKey[0];
    if (currentWorkspaceKey) {
      currentWorkspaceKey.workspaceKeyBox =
        rawWorkspace.workspaceKey[0].workspaceKeyBoxes[0];
    }
    rawWorkspace.workspaceKey.forEach((workspaceKey) => {
      workspaceKey.workspaceKeyBoxes.forEach(
        (workspaceKeyBox: WorkspaceKeyBox) => {
          const creatorDevice =
            creatorDeviceLookup[workspaceKeyBox.creatorDeviceSigningPublicKey];
          workspaceKeyBox.creatorDevice = creatorDevice;
        }
      );
    });
    const workspace: Workspace = {
      id: rawWorkspace.id,
      name: rawWorkspace.name,
      idSignature: rawWorkspace.idSignature,
      members: members,
      workspaceKeys: rawWorkspace.workspaceKey,
      currentWorkspaceKey,
    };
    workspaces.push(workspace);
  });
  return workspaces;
}
