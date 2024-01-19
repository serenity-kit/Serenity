import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";

type Params = {
  workspaceId: string;
  userId?: string;
  hash?: string;
  invitationId?: string;
  documentShareLinkToken?: string;
  prisma: Prisma.TransactionClient;
};
export async function getWorkspaceMemberDevicesProof({
  workspaceId,
  userId,
  hash,
  invitationId,
  documentShareLinkToken,
  prisma,
}: Params) {
  const invitation = invitationId
    ? await prisma.workspaceInvitations.findFirstOrThrow({
        where: { id: invitationId, expiresAt: { gte: new Date() } },
        select: { workspaceId: true },
      })
    : undefined;
  const userWorkspace = userId
    ? await prisma.usersToWorkspaces.findFirst({
        where: { userId, workspaceId },
        select: { workspace: true },
      })
    : undefined;
  const documentShareLink = documentShareLinkToken
    ? await prisma.documentShareLink.findFirst({
        where: { token: documentShareLinkToken },
        include: { document: true },
      })
    : undefined;
  if (documentShareLink) {
    if (documentShareLink.document.workspaceId !== workspaceId) {
      throw new ForbiddenError("Unauthorized");
    }
  }

  if (!userWorkspace && !invitation && !documentShareLink) {
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
