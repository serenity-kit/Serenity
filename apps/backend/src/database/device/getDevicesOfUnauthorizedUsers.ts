import { Device } from "../../../prisma/generated/output";
import { WorkspaceIdWithDevices } from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  userId: string;
};
export async function getDevicesOfUnauthorizedUsers({
  userId,
}: Params): Promise<WorkspaceIdWithDevices[]> {
  const userToWorkspaces = await prisma.usersToWorkspaces.findMany({
    where: {
      userId,
      isAuthorizedMember: true,
    },
  });
  const userWorkspaceIds: string[] = [];
  userToWorkspaces.forEach((userToWorkspace) => {
    userWorkspaceIds.push(userToWorkspace.workspaceId);
  });

  const usersInWorkspaceAwaitingDecryption =
    await prisma.usersToWorkspaces.findMany({
      where: {
        workspaceId: { in: userWorkspaceIds },
        isAuthorizedMember: false,
        userId: { not: userId },
      },
      select: { userId: true, workspaceId: true },
    });
  const userIdsAwaitingDecryption: string[] = [];
  const userIdToWorkspaceIdsLookup: { [userId: string]: string[] } = {};
  usersInWorkspaceAwaitingDecryption.forEach((userAwaitingDecryption) => {
    const userIdAwaitingDecryption = userAwaitingDecryption.userId;
    userIdsAwaitingDecryption.push(userIdAwaitingDecryption);
    if (!(userId in userIdToWorkspaceIdsLookup)) {
      userIdToWorkspaceIdsLookup[userIdAwaitingDecryption] = [];
    }
    userIdToWorkspaceIdsLookup[userIdAwaitingDecryption].push(
      userAwaitingDecryption.workspaceId
    );
  });
  const unauthorizedDevices = await prisma.device.findMany({
    where: { userId: { in: userIdsAwaitingDecryption } },
  });
  // now we have a list of unautharized devices, each with a userid
  // and a workspaceId lookup keyed by userId
  // we want to dump the unauthorized devices into their appropriate workspaces
  const workspaceDevicesLookup: { [workspaceId: string]: Device[] } = {};
  for (let unauthorizedDevice of unauthorizedDevices) {
    if (!unauthorizedDevice.userId) {
      continue;
    }
    const workspaceIds = userIdToWorkspaceIdsLookup[unauthorizedDevice.userId];
    if (!workspaceIds) {
      continue;
    }
    for (let workspaceId of workspaceIds) {
      if (!(workspaceId in workspaceDevicesLookup)) {
        workspaceDevicesLookup[workspaceId] = [];
      }
      workspaceDevicesLookup[workspaceId].push(unauthorizedDevice);
    }
  }
  // format for export to graphql
  const workspaceDevices: WorkspaceIdWithDevices[] = [];
  for (const [workspaceId, devices] of Object.entries(workspaceDevicesLookup)) {
    workspaceDevices.push({
      workspaceId,
      devices,
    });
  }
  return workspaceDevices;
}
