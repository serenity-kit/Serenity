import { prisma } from "../prisma";

type Params = {
  id: string;
  name: string | null;
  parentFolderId: string | null;
  workspaceId: string;
};

export async function createDocument({
  id,
  name,
  parentFolderId,
  workspaceId,
}: Params) {
  let folderName = "Untitled";
  if (name) {
    folderName = name;
  }
  return prisma.document.create({
    data: { id, name: folderName, parentFolderId, workspaceId },
  });
}
