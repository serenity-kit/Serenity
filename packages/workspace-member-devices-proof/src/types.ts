import { z } from "zod";

export const Version = z.number().int().nonnegative();
export const WorkspaceMemberDevicesProofClock = z.number().int().nonnegative();

export const WorkspaceMemberDevicesProofData = z.object({
  clock: WorkspaceMemberDevicesProofClock,
  workspaceChainHash: z.string(),
  userChainHashes: z.record(z.string()),
});

export const WorkspaceMemberDevicesProof = z.object({
  hash: z.string(),
  hashSignature: z.string(),
  version: Version,
  clock: WorkspaceMemberDevicesProofClock,
});

export type Version = z.infer<typeof Version>;
export type WorkspaceMemberDevicesProofClock = z.infer<
  typeof WorkspaceMemberDevicesProofClock
>;
export type WorkspaceMemberDevicesProofData = z.infer<
  typeof WorkspaceMemberDevicesProofData
>;
export type WorkspaceMemberDevicesProof = z.infer<
  typeof WorkspaceMemberDevicesProof
>;
