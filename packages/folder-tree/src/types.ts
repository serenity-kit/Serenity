import { z } from "zod";

export const Version = z.number().int().nonnegative();
export const FolderTreeClock = z.number().int().nonnegative();

export const FolderHashData = z.object({
  clock: FolderTreeClock,
  folderId: z.string(),
  folderNameCiphertext: z.string(),
  folderNameNonce: z.string(),
  folderNameAuthorPublicKey: z.string(),
  folderNameSignature: z.string(),
  subfolderHashes: z.record(z.string()),
  documentHashes: z.record(z.string()),
});

export const DocumentHashData = z.object({
  clock: FolderTreeClock,
  documentId: z.string(),
  documentChainHash: z.string(),
});

export const FolderTree = z.object({
  version: Version,
  clock: FolderTreeClock,
  root: z.string(),
});
