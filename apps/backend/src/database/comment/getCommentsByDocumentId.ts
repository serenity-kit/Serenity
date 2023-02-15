import { ForbiddenError, UserInputError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  userId: string;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
  deviceSigningPublicKey?: string | null | undefined;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getCommentsByDocumentId({
  userId,
  documentId,
  documentShareLinkToken,
  deviceSigningPublicKey,
  cursor,
  skip,
  take,
}: Params) {
  // verify the document exists
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  // if the user has a documentShareLinkToken, verify it
  let userDeviceSigningPublicKey = "";
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
    userDeviceSigningPublicKey = documentShareLink.deviceSigningPublicKey;
  }
  // if no documentShareLinkToken, the user must have access to the workspace
  if (!documentShareLink) {
    if (!deviceSigningPublicKey) {
      throw new UserInputError("deviceSigningPublicKey is required");
    }
    const user2Workspace = await prisma.usersToWorkspaces.findFirst({
      where: {
        userId,
        workspaceId: document.workspaceId,
      },
    });
    if (!user2Workspace) {
      throw new ForbiddenError("Unauthorized");
    }
    userDeviceSigningPublicKey = deviceSigningPublicKey;
  }

  const comments = await prisma.comment.findMany({
    where: { documentId },
    cursor,
    skip,
    take,
    orderBy: { createdAt: "asc" },
    include: {
      creatorDevice: true,
      commentReplies: {
        orderBy: { createdAt: "asc" },
        include: { creatorDevice: true },
      },
      workspaceKey: {
        include: {
          workspaceKeyBoxes: {
            include: { creatorDevice: true },
            where: { deviceSigningPublicKey: userDeviceSigningPublicKey },
          },
        },
      },
    },
  });
  return comments;
}
