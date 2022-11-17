import { ForbiddenError, UserInputError } from "apollo-server-express";
import { prisma } from "../prisma";

type Cursor = {
  token?: string;
};

type Params = {
  token: string;
  userId: string;
};

export async function getDocumentShareLink({ userId, token }: Params) {
  const documentShareLink = await prisma.documentShareLink.findFirst({
    where: { token },
    include: { document: true },
  });
  if (!documentShareLink) {
    throw new UserInputError("Invalid token");
  }
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId: documentShareLink.document.workspaceId! },
    select: { role: true },
  });
  if (!userToWorkspace) {
    throw new ForbiddenError("Unauthorized");
  }
  return documentShareLink;
}
