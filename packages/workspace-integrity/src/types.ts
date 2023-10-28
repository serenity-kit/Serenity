import { z } from "zod";

export const Version = z.number().int().nonnegative();
export const WorkspaceIntegrityClock = z.number().int().nonnegative();

export const WorkspaceIntegrityData = z.object({
  clock: WorkspaceIntegrityClock,
  workspaceInfoCiphertext: z.string(),
  workspaceInfoNonce: z.string(),
  folderTreeRootHash: z.string(),
  workspaceChainHash: z.string(),
  userChainHashes: z.record(z.string()),
});

export const WorkspaceIntegrityProof = z.object({
  hash: z.string(),
  hashSignature: z.string(),
  version: Version,
  clock: WorkspaceIntegrityClock,
});

export type Version = z.infer<typeof Version>;
export type WorkspaceIntegrityClock = z.infer<typeof WorkspaceIntegrityClock>;
export type WorkspaceIntegrityData = z.infer<typeof WorkspaceIntegrityData>;
export type WorkspaceIntegrityProof = z.infer<typeof WorkspaceIntegrityProof>;
