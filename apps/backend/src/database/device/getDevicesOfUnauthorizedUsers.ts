import { Device } from "../../../prisma/generated/output";
import {
  MemberIdWithDevice,
  WorkspaceIdWithMemberDevices,
} from "../../types/workspace";
import { prisma } from "../prisma";

type Params = {
  userId: string;
};
export async function getDevicesOfUnauthorizedUsers({
  userId,
}: Params): Promise<WorkspaceIdWithMemberDevices[]> {
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
  const workspaceMemberLookup: {
    [workspaceId: string]: { [memberId: string]: Device[] };
  } = {};

  for (let unauthorizedDevice of unauthorizedDevices) {
    const memberId = unauthorizedDevice.userId!;
    const workspaceIds = userIdToWorkspaceIdsLookup[memberId];
    if (!workspaceIds) {
      continue;
    }
    for (let workspaceId of workspaceIds) {
      if (!(workspaceId in workspaceMemberLookup)) {
        const memberLookup = {};
        memberLookup[memberId] = [];
        workspaceMemberLookup[workspaceId] = memberLookup;
      }
      workspaceMemberLookup[workspaceId][memberId].push(unauthorizedDevice);
    }
  }
  // format for export to graphql
  const workspaceMemberDevices: WorkspaceIdWithMemberDevices[] = [];
  for (const [workspaceId, data] of Object.entries(workspaceMemberLookup)) {
    const members: MemberIdWithDevice[] = [];
    const workspaceDevice = {
      id: workspaceId,
      members,
    };
    for (const [memberId, devices] of Object.entries(data)) {
      workspaceDevice.members.push({
        id: memberId,
        devices,
      });
    }
    workspaceMemberDevices.push(workspaceDevice);
  }
  return workspaceMemberDevices;
}
