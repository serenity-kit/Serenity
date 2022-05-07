import { prisma } from "./prisma";

type Params = {
  id: string;
  workspaceId: string;
};

export async function createDocument({ id, workspaceId }: Params) {
  return prisma.document.create({
    data: { id, name: "Untitled", workspaceId },
  });
}
