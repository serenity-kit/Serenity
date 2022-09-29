import { ForbiddenError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceKey } from "../../../prisma/generated/output";
import { WorkspaceKeyBox } from "../../types/workspace";
import {
  MemberWithWorkspaceKeyBoxes,
  WorkspaceKeyWithMembers,
  WorkspaceMemberDevices,
  WorkspaceMemberKeyBox,
} from "../../types/workspaceDevice";
import { getOrCreateCreatorDevice } from "../../utils/device/getOrCreateCreatorDevice";
import { prisma } from "../prisma";

export type Params = {
  userId: string;
  creatorDeviceSigningPublicKey: string;
  workspaceMemberDevices: WorkspaceMemberDevices[];
};
export async function attachDevicesToWorkspaces({
  userId,
  creatorDeviceSigningPublicKey,
  workspaceMemberDevices,
}: Params): Promise<WorkspaceMemberKeyBox[]> {
  return await prisma.$transaction(async (prisma) => {
    // filter out workspaces that the creator is not a member of
    const requestedWorkspaceIds = workspaceMemberDevices.map(
      (workspace) => workspace.id
    );
    const validUserWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: { userId, workspaceId: { in: requestedWorkspaceIds } },
      select: { workspaceId: true },
    });
    if (!validUserWorkspaces) {
      throw new ForbiddenError("Unauthorized");
    }
    const validUserWorkspaceIds = validUserWorkspaces.map(
      (workspace) => workspace.workspaceId
    );
    // match the workspaces to the authorized users
    // we don't want to create keys for users that don't have access
    // to a workspace
    const userWorkspaces = await prisma.usersToWorkspaces.findMany({
      where: {
        workspaceId: { in: validUserWorkspaceIds },
        isAuthorizedMember: false,
      },
      select: { userId: true, workspaceId: true },
    });
    const userWorkspaceLookup: { [userId: string]: string[] } = {};
    const verifiedWorkspaceIds: string[] = [];
    userWorkspaces.forEach((userWorkspace) => {
      if (!(userWorkspace.userId in userWorkspaceLookup)) {
        userWorkspaceLookup[userWorkspace.userId] = [];
      }
      userWorkspaceLookup[userWorkspace.userId].push(userWorkspace.workspaceId);
      verifiedWorkspaceIds.push(userWorkspace.workspaceId);
    });

    // get the workspaceKeys for the workspaces
    const workspaceKeysForWorkspaces = await prisma.workspaceKey.findMany({
      where: { workspaceId: { in: verifiedWorkspaceIds } },
    });
    const workspaceKeyBoxLookup: { [workspaceId: string]: WorkspaceKey[] } = {};
    const workspaceKeyIds: string[] = [];
    workspaceKeysForWorkspaces.forEach((workspaceKey) => {
      if (!(workspaceKey.workspaceId in workspaceKeyBoxLookup)) {
        workspaceKeyBoxLookup[workspaceKey.workspaceId] = [];
      }
      workspaceKeyBoxLookup[workspaceKey.workspaceId].push(workspaceKey);
      workspaceKeyIds.push(workspaceKey.id);
    });

    // make sure the user controls this creatorDevice
    const creatorDevice = await getOrCreateCreatorDevice({
      prisma,
      userId,
      signingPublicKey: creatorDeviceSigningPublicKey,
    });

    const workspaceKeyIdUserLookup: { [workspaceKeyId: string]: string[] } = {};
    const workspaceIdUserIdLookup: { [workspaceId: string]: string[] } = {};
    const userIdKeyBoxCiphertextLoookup: { [userId: string]: string[] } = {};
    const newKeyBoxes: WorkspaceKeyBox[] = [];
    for (let workspaceData of workspaceMemberDevices) {
      const workspaceId = workspaceData.id;
      workspaceIdUserIdLookup[workspaceId] = [];
      for (let member of workspaceData.workspaceKeysMembers) {
        const workspaceId = workspaceData.id;
        for (let workspaceKeyDeviceMembers of workspaceData.workspaceKeysMembers) {
          const workspaceKeyId = workspaceKeyDeviceMembers.id;
          for (let member of workspaceKeyDeviceMembers.members) {
            const receiverUserId = member.id;
            workspaceIdUserIdLookup[workspaceId].push(member.id);

            if (!(receiverUserId in userWorkspaceLookup)) {
              throw new Error("userId not found");
              // continue;
            }
            if (!(workspaceId in workspaceKeyBoxLookup)) {
              throw new Error("workspace not found");
              // continue;
            }
            // const workspaceKeys = workspaceKeyBoxLookup[workspaceId];
            for (let workspaceDevice of member.workspaceDevices) {
              const newKeyBox: WorkspaceKeyBox = {
                id: uuidv4(),
                workspaceKeyId,
                creatorDeviceSigningPublicKey,
                deviceSigningPublicKey:
                  workspaceDevice.receiverDeviceSigningPublicKey,
                ciphertext: workspaceDevice.ciphertext,
                nonce: workspaceDevice.nonce,
              };
              newKeyBoxes.push(newKeyBox);
              if (!(workspaceKeyId in workspaceKeyIdUserLookup)) {
                workspaceKeyIdUserLookup[workspaceKeyId] = [];
              }
              workspaceKeyIdUserLookup[workspaceKeyId].push(receiverUserId);
              if (!(receiverUserId in userIdKeyBoxCiphertextLoookup)) {
                userIdKeyBoxCiphertextLoookup[receiverUserId] = [];
              }
              userIdKeyBoxCiphertextLoookup[receiverUserId].push(
                workspaceDevice.ciphertext
              );
            }
          }
        }
      }
    }
    await prisma.workspaceKeyBox.createMany({
      data: newKeyBoxes,
    });
    for (let workspaceId of Object.keys(workspaceIdUserIdLookup)) {
      const userIds = workspaceIdUserIdLookup[workspaceId];
      await prisma.usersToWorkspaces.updateMany({
        data: { isAuthorizedMember: true },
        where: { workspaceId: workspaceId, userId: { in: userIds } },
      });
    }

    const rawWorkspaceKeys = await prisma.workspaceKey.findMany({
      where: { id: { in: workspaceKeyIds } },
      include: { workspaceKeyBoxes: true },
    });
    const formattedworkspaceMemberDevices: WorkspaceMemberKeyBox[] = [];
    const workspaceIdRowLookup: { [workspaceId: string]: number } = {};
    rawWorkspaceKeys.forEach((workspaceKey) => {
      const workspaceId = workspaceKey.workspaceId;
      if (!(workspaceId in workspaceIdRowLookup)) {
        const memberWorkspaceKeyBoxes: WorkspaceMemberKeyBox = {
          id: workspaceKey.workspaceId,
          workspaceKeys: [],
        };
        formattedworkspaceMemberDevices.push(memberWorkspaceKeyBoxes);
        workspaceIdRowLookup[workspaceId] =
          formattedworkspaceMemberDevices.length - 1;
      }
      const workspaceWithMember: WorkspaceKeyWithMembers = {
        id: workspaceKey.id,
        generation: workspaceKey.generation,
        members: [],
      };
      // create workspaceKey with member list
      const memberWorkspaceKeyBoxes =
        formattedworkspaceMemberDevices[workspaceIdRowLookup[workspaceId]];
      // add members
      const userIds = workspaceKeyIdUserLookup[workspaceKey.id];
      userIds.forEach((receiverUserId) => {
        const workspaceMember: MemberWithWorkspaceKeyBoxes = {
          id: receiverUserId,
          workspaceKeyBoxes: [],
        };
        // add key boxes for members
        const ciphertexts = userIdKeyBoxCiphertextLoookup[receiverUserId];
        workspaceKey.workspaceKeyBoxes.forEach((workspaceKeyBox) => {
          if (ciphertexts.includes(workspaceKeyBox.ciphertext)) {
            workspaceMember.workspaceKeyBoxes.push(workspaceKeyBox);
          }
        });
        workspaceWithMember.members.push(workspaceMember);
      });
      memberWorkspaceKeyBoxes.workspaceKeys.push(workspaceWithMember);
    });

    return formattedworkspaceMemberDevices;
  });
}
