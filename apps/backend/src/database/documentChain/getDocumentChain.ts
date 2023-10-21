import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  id?: string;
};

type Params = {
  documentId: string;
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};
export async function getDocumentChain({
  documentId,
  userId,
}: // cursor,
// skip,
// take,
Params) {
  // make sure the user has access to the workspace
  // by retrieving and verifying the workspace connection
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    throw new ForbiddenError("Unauthorized");
  }
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId: document.workspaceId },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }

  const documentChain = await prisma.documentChainEvent.findMany({
    where: { documentId },
    // cursor,
    // skip,
    // take,
    orderBy: { position: "asc" },
    select: { position: true, content: true },
  });
  return documentChain.map((documentChainEvent) => {
    return {
      ...documentChainEvent,
      serializedContent: JSON.stringify(documentChainEvent.content),
    };
  });
}
