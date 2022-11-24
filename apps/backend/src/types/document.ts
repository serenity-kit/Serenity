import { KeyDerivationTrace } from "@naisho/core";
import { WorkspaceKey } from "./workspace";

export type Document = {
  id: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  workspaceKey?: WorkspaceKey | null;
  contentSubkeyId?: number | null;
  parentFolderId: string | null;
  workspaceId: string;
  createdAt?: Date;
  updatedAt?: Date;
  nameKeyDerivationTrace: KeyDerivationTrace;
};

export const formatDocument = (document: any): Document => {
  return {
    ...document,
    nameKeyDerivationTrace:
      document.nameKeyDerivationTrace as KeyDerivationTrace,
  };
};
