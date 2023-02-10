import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  deviceSigningPublicKey: string;
  documentId: string;
};
export async function getWorkspaceKeyByDocumentId({
  userId,
  documentId,
  deviceSigningPublicKey,
}: Params) {
  // 1. get the workspaceId for the documentId
  const document = await prisma.document.findFirst({
    where: { id: documentId },
    select: { workspaceId: true },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // 2. check if the user is a member of the document's workspace
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId: document.workspaceId,
    },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // 3. if the user is a workspace member, return the workspace key
  const workspaceKey = await prisma.workspaceKey.findFirst({
    where: {
      workspaceId: document.workspaceId,
    },
    orderBy: { generation: "desc" },
    include: {
      workspaceKeyBoxes: {
        where: {
          deviceSigningPublicKey,
        },
      },
    },
  });
  // if the workspaceKey is null, the user is still waiting
  // for keys to be made for their workspace invitation
  return workspaceKey;
}
