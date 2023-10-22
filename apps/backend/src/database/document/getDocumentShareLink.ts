import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  token: string;
};

export async function getDocumentShareLink({ token }: Params) {
  const documentShareLink = await prisma.documentShareLink.findFirst({
    where: { token },
    include: {
      document: true,
      snapshotKeyBoxes: { include: { creatorDevice: true } },
    },
  });
  if (!documentShareLink) {
    throw new ForbiddenError("Unauthorized");
  }
  return {
    ...documentShareLink,
    workspaceId: documentShareLink.document.workspaceId,
  };
}
