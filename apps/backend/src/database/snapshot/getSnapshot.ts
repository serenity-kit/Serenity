import { ForbiddenError, UserInputError } from "apollo-server-express";
import { Snapshot } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Params = {
  userId: string;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
};

export async function getSnapshot({
  userId,
  documentId,
  documentShareLinkToken,
}: Params): Promise<Snapshot | null> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
    },
    include: {
      activeSnapshot: true,
    },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  let documentShareLink: any = null;
  if (documentShareLinkToken) {
    documentShareLink = await prisma.documentShareLink.findFirst({
      where: {
        token: documentShareLinkToken,
        documentId,
      },
    });
    if (!documentShareLink) {
      throw new UserInputError("Invalid documentShareLinkToken");
    }
  } else {
    // if no documentShareLinkToken, the user must have access to the workspace
    const user2Workspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId: document.workspaceId,
      },
    });
    if (!user2Workspace) {
      throw new ForbiddenError("Unauthorized");
    }
  }
  return document.activeSnapshot;
}
