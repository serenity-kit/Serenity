import { ForbiddenError } from "apollo-server-express";
import { prisma } from "../prisma";

type Params = {
  token: string;
  snapshotId: string;
};

export async function getDocumentShareLinkSnapshotKeyBox({
  token,
  snapshotId,
}: Params) {
  const snapshotKeyBox = await prisma.snapshotKeyBox.findFirst({
    where: {
      documentShareLink: { token },
      snapshotId,
    },
    include: { creatorDevice: true },
  });

  if (!snapshotKeyBox) {
    throw new ForbiddenError("Unauthorized");
  }

  return snapshotKeyBox;
}
