import { KeyDerivationTrace } from "@serenity-tools/common";
import { Folder as PrismaFolder } from "../../prisma/generated/output";

export type Folder = PrismaFolder & {
  parentFolders?: Folder[] | null;
  keyDerivationTrace: KeyDerivationTrace;
};

export const formatFolder = (folder: PrismaFolder): Folder => {
  return {
    ...folder,
    keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace,
  };
};
