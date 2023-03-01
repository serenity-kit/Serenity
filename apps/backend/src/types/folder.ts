import { KeyDerivationTrace2 } from "@naisho/core";
import { Folder as PrismaFolder } from "../../prisma/generated/output";

export type Folder = PrismaFolder & {
  parentFolders?: Folder[] | null;
  keyDerivationTrace: KeyDerivationTrace2;
};

export const formatFolder = (folder: PrismaFolder): Folder => {
  return {
    ...folder,
    keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace2,
  };
};
