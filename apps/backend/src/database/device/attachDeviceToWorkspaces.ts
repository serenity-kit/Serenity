import { v4 as uuidv4 } from "uuid";
import { WorkspaceKey, WorkspaceKeyBox } from "../../types/workspace";
import { prisma } from "../prisma";

export type AttachToDeviceWorkspaceKeyBoxData = {
  workspaceId: string;
  nonce: string;
  ciphertext: string;
};

type Params = {
  userId: string;
  receiverDeviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  workspaceKeyBoxes: AttachToDeviceWorkspaceKeyBoxData[];
};

export async function attachDeviceToWorkspaces({
  userId,
  receiverDeviceSigningPublicKey,
  creatorDeviceSigningPublicKey,
  workspaceKeyBoxes,
}: Params): Promise<WorkspaceKey[]> {
  const workspaceKeyBoxLookup: {
    [workspaceId: string]: AttachToDeviceWorkspaceKeyBoxData;
  } = {};
  const workspaceIds: string[] = [];
  workspaceKeyBoxes.forEach((workspaceKeyBox) => {
    workspaceKeyBoxLookup[workspaceKeyBox.workspaceId] = workspaceKeyBox;
    workspaceIds.push(workspaceKeyBox.workspaceId);
  });
  try {
    return await prisma.$transaction(async (prisma) => {
      // 1. get the workspaces associated with this user
      // 2. Add any missing workspaceKeys
      // 3. Create a new worskpaceKeyBoxes for this signingPublicKey
      //    on all workspaceKeys for the user's workspaces
      const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
        where: {
          workspaceId: {
            in: workspaceIds,
          },
          userId,
        },
        include: {
          workspace: {
            include: {
              workspaceKey: {
                orderBy: {
                  generation: "desc",
                },
              },
            },
          },
        },
      });
      console.log({ userToWorkspaces });
      const userWorkspaceIds: string[] = [];
      const newWorkspaceKeys: WorkspaceKey[] = [];
      userToWorkspaces.forEach(async (userToWorkspace) => {
        userWorkspaceIds.push(userToWorkspace.workspaceId);
        const workspace = userToWorkspace.workspace;
        const workspaceKeys = workspace.workspaceKey;
        if (workspaceKeys.length === 0) {
          newWorkspaceKeys.push({
            id: uuidv4(),
            workspaceId: workspace.id,
            generation: 0,
          });
        }
      });
      await prisma.workspaceKey.createMany({
        data: newWorkspaceKeys,
      });

      const workspaces = await prisma.workspace.findMany({
        where: { id: { in: workspaceIds } },
        include: {
          workspaceKey: {
            include: { workspaceKeyBoxes: true },
            orderBy: {
              generation: "desc",
            },
          },
        },
      });
      console.log({ workspaces });
      const workspaceKeyBoxes: WorkspaceKeyBox[] = [];
      workspaces.forEach((workspace) => {
        const workspaceKey = workspace.workspaceKey[0];
        const currentWorkspaceKeyBoxData = workspaceKeyBoxLookup[workspace.id];
        workspaceKeyBoxes.push({
          id: uuidv4(),
          workspaceKeyId: workspaceKey.id,
          deviceSigningPublicKey: receiverDeviceSigningPublicKey,
          creatorDeviceSigningPublicKey,
          nonce: currentWorkspaceKeyBoxData.nonce,
          ciphertext: currentWorkspaceKeyBoxData.ciphertext,
        });
      });
      console.log({ workspaceKeyBoxes });

      await prisma.workspaceKeyBox.createMany({
        data: workspaceKeyBoxes,
      });
      const rawWorkspaceKeys = await prisma.workspaceKey.findMany({
        where: { workspaceId: { in: userWorkspaceIds } },
        include: { workspaceKeyBoxes: true },
        orderBy: { generation: "desc" },
      });
      const workspaceKeys: WorkspaceKey[] = [];
      rawWorkspaceKeys.forEach(({ workspaceKeyBoxes, ...workspaceKey }) => {
        workspaceKeys.push({
          ...workspaceKey,
          workspaceKeyBox: workspaceKeyBoxes[0],
        });
      });
      console.log({ workspaceKeys });
      return workspaceKeys;
    });
  } catch (error) {
    throw error;
  }
}
