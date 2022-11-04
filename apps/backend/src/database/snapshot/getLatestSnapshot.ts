import { ForbiddenError, UserInputError } from "apollo-server-express";
import { formatSnapshot } from "../../types/snapshot";
import { prisma } from "../prisma";

export type Props = {
  documentId: string;
  userId: string;
};
export const getLatestSnapshot = async ({ documentId, userId }: Props) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
    include: {
      snapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!document) {
    throw new UserInputError("Invalid documentId");
  }
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId: document.workspaceId },
    select: { role: true },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  // TODO: check if user has access to the document with a virtual device
  if (!document.snapshots.length) {
    return null;
  }
  return formatSnapshot(document.snapshots[0]);
};
