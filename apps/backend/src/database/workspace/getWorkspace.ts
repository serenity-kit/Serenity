import { CreatorDevice } from "../../types/device";
import {
  Workspace,
  WorkspaceKey,
  WorkspaceKeyBox,
  WorkspaceMember,
} from "../../types/workspace";
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
  // include userstoworkspaces but in descending alphabetical order by userId
  const rawWorkspace = await prisma.workspace.findUnique({
    include: {
      usersToWorkspaces: {
        orderBy: {
          userId: "desc",
        },
        include: {
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
    where: { id },
  });
  if (!rawWorkspace) {
    return null;
  }
  if (
    rawWorkspace.usersToWorkspaces.some(
      (connection) => connection.userId === userId
    )
  ) {
    const creatorDeviceSigningPublicKeys: string[] = [];
    rawWorkspace.workspaceKey.forEach((workspaceKey) => {
      workspaceKey.workspaceKeyBoxes.forEach((workspaceKeyBox) => {
        creatorDeviceSigningPublicKeys.push(
          workspaceKeyBox.creatorDeviceSigningPublicKey
        );
      });
    });

    const creatorDevices = await prisma.device.findMany({
      where: { signingPublicKey: { in: creatorDeviceSigningPublicKeys } },
    });
    const creatorDeviceLookup: { [signingPublicKey: string]: CreatorDevice } =
      {};
    creatorDevices.forEach((device) => {
      creatorDeviceLookup[device.signingPublicKey] = device;
    });

    const workspaceMembers: WorkspaceMember[] = [];
    rawWorkspace.usersToWorkspaces.forEach((userToWorkspace) => {
      const workspaceMember: WorkspaceMember = {
        userId: userToWorkspace.userId,
        username: userToWorkspace.user.username,
        isAdmin: userToWorkspace.isAdmin,
      };
      workspaceMembers.push(workspaceMember);
    });
    let currentWorkspaceKey: WorkspaceKey = rawWorkspace.workspaceKey[0];
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
      members: workspaceMembers,
      workspaceKeys: rawWorkspace.workspaceKey,
      currentWorkspaceKey: currentWorkspaceKey,
    };
    return workspace;
  }
  return null;
}
