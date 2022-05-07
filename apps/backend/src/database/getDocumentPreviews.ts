import { prisma } from "./prisma";

export async function getDocumentPreviews({ workspaceId, cursor, skip, take }) {
  return await prisma.document.findMany({
    where: {
      workspaceId,
    },
    cursor,
    skip,
    take,
  });
}
