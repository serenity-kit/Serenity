import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  userId: string;
  documentId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getCommentsByDocumentId({
  userId,
  documentId,
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
  const user2Workspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId,
      workspaceId: document.workspaceId,
    },
  });
  if (!user2Workspace) {
    throw new ForbiddenError("Unauthorized");
  }
  const comments = await prisma.comment.findMany({
    where: { documentId },
    cursor,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      creatorDevice: true,
      commentReplies: {
        orderBy: { createdAt: "desc" },
        include: { creatorDevice: true },
      },
    },
  });
  return comments;
}
