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
    },
  });

  if (
    !documentShareLink ||
    documentShareLink.document.activeSnapshotId === null
  ) {
    throw new ForbiddenError("Unauthorized");
  }

  const activeSnapshotKeyBox = await prisma.snapshotKeyBox.findFirst({
    where: {
      documentShareLink: { token },
      snapshotId: documentShareLink.document.activeSnapshotId,
    },
    include: { creatorDevice: true },
  });

  if (!activeSnapshotKeyBox) {
    throw new ForbiddenError("No active snapshot key box found");
  }

  return {
    ...documentShareLink,
    activeSnapshotKeyBox,
    workspaceId: documentShareLink.document.workspaceId,
  };
}
