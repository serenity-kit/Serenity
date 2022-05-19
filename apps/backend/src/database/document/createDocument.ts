import { prisma } from "../prisma";

type Params = {
  id: string;
  parentFolderId: string | null;
  workspaceId: string;
};

export async function createDocument({
  id,
  parentFolderId,
  workspaceId,
}: Params) {
  return prisma.document.create({
    data: { id, name: "Untitled", parentFolderId, workspaceId },
  });
}
