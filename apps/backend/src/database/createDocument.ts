import { prisma } from "./prisma";

type Params = {
  documentId: string;
  name: string;
  workspaceId: string;
};

export async function createDocument({
  documentId,
  name,
  workspaceId,
}: Params) {
  return await prisma.document.create({
    data: { id: documentId, name, workspaceId },
  });
}
