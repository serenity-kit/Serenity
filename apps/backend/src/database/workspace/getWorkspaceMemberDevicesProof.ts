import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  workspaceId: string;
  userId: string;
  hash?: string;
  invitationId?: string;
};
export async function getWorkspaceMemberDevicesProof({
  workspaceId,
  userId,
  hash,
  invitationId,
}: Params) {
  const invitation = invitationId
    ? await prisma.workspaceInvitations.findFirstOrThrow({
        where: { id: invitationId, expiresAt: { gte: new Date() } },
        select: { workspaceId: true },
      })
    : undefined;
  const userWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
    select: { workspace: true },
  });
  if (!userWorkspace && !invitation) {
    throw new ForbiddenError("Unauthorized");
  }
  const workspaceMemberDevicesProof =
    await prisma.workspaceMemberDevicesProof.findFirstOrThrow({
      where: hash
        ? {
            workspaceId,
            hash,
          }
        : {
            workspaceId,
          },
      orderBy: {
        clock: "desc",
      },
    });

  return {
    proof:
      workspaceMemberDevicesProof.proof as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof,
    data: workspaceMemberDevicesProof.data as workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData,
    serializedData: JSON.stringify(workspaceMemberDevicesProof.data),
    workspaceId,
    authorMainDeviceSigningPublicKey:
      workspaceMemberDevicesProof.authorMainDeviceSigningPublicKey,
  };
}
