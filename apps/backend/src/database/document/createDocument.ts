import { prisma } from "../prisma";

type Params = {
  id: string;
  name?: string | null;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  subkeyId?: number | null;
  parentFolderId?: string | null;
  workspaceId: string;
};

export async function createDocument({
  id,
  name,
  encryptedName,
  encryptedNameNonce,
  subkeyId,
  parentFolderId,
  workspaceId,
}: Params) {
  let folderName = "Untitled";
  if (name) {
    folderName = name;
  }
  const document = await prisma.document.create({
    data: {
      id,
      name: folderName,
      encryptedName,
      encryptedNameNonce,
      subkeyId,
      parentFolderId,
      workspaceId,
    },
  });
  return document;
}
