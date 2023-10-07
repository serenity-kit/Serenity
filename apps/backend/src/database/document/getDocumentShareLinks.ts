import { ForbiddenError } from "apollo-server-express";
import { Prisma } from "../../../prisma/generated/output";
import { prisma } from "../prisma";

type Cursor = {
  token?: string;
};

type Params = {
  documentId: string;
  userId: string;
  cursor?: Cursor;
  skip?: number;
  take: number;
};

export async function getDocumentShareLinks({
  userId,
  documentId,
  cursor,
  skip,
  take,
}: Params) {
  try {
    return await prisma.$transaction(
      async (prisma) => {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
          select: {
            workspace: {
              include: { usersToWorkspaces: { where: { userId: userId } } },
            },
          },
        });
        if (!document || document.workspace.usersToWorkspaces.length === 0) {
          throw new ForbiddenError("Unauthorized");
        }

        const documentShareLinks = await prisma.documentShareLink.findMany({
          where: { documentId },
          cursor,
          skip,
          take,
        });

        return documentShareLinks;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    throw error;
  }
}
