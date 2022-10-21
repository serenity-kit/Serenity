import { KeyDerivationTrace } from "./folder";
import { WorkspaceKey } from "./workspace";

export type Document = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKeyId?: string | null;
  workspaceKey?: WorkspaceKey | null;
  subkeyId?: number | null;
  contentSubkeyId?: number | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
  nameKeyDerivationTrace: KeyDerivationTrace;
  contentKeyDerivationTrace: KeyDerivationTrace;
};

export const formatDocument = (document: any): Document => {
  return {
    ...document,
    nameKeyDerivationTrace:
      document.nameKeyDerivationTrace as KeyDerivationTrace,
    contentKeyDerivationTrace:
      document.contentKeyDerivationTrace as KeyDerivationTrace,
  };
};
