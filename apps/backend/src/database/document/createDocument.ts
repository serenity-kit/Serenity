import { prisma } from "../prisma";

type Params = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  subkeyId?: number | null;
  parentFolderId?: string | null;
  workspaceId: string;
};

export async function createDocument({
  id,
  encryptedName,
  encryptedNameNonce,
  subkeyId,
  parentFolderId,
  workspaceId,
}: Params) {
  const document = await prisma.document.create({
    data: {
      id,
      encryptedName,
      encryptedNameNonce,
      subkeyId,
      parentFolderId,
      workspaceId,
    },
  });
  return document;
}
