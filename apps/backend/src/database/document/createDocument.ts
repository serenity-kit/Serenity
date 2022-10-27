import { KeyDerivationTrace } from "../../types/folder";
import { prisma } from "../prisma";

type Params = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKeyId?: string | null;
  subkeyId?: number | null;
  contentSubkeyId?: number | null;
  parentFolderId?: string | null;
  workspaceId: string;
  nameKeyDerivationTrace: KeyDerivationTrace;
};

export async function createDocument({
  id,
  encryptedName,
  encryptedNameNonce,
  workspaceKeyId,
  subkeyId,
  contentSubkeyId,
  parentFolderId,
  workspaceId,
  nameKeyDerivationTrace,
}: Params) {
  const document = await prisma.document.create({
    data: {
      id,
      encryptedName,
      encryptedNameNonce,
      workspaceKeyId,
      subkeyId,
      contentSubkeyId,
      parentFolderId,
      workspaceId,
      nameKeyDerivationTrace,
    },
  });
  return document;
}
