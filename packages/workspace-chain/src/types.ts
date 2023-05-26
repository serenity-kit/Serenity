import { z } from "zod";

export const Role = z.enum(["ADMIN", "EDITOR", "COMMENTER", "VIEWER"]);

export const CreateChainTransaction = z.object({
  type: z.literal("create"),
  id: z.string(),
});

export const AddInvitationTransaction = z.object({
  type: z.literal("add-invitation"),
  invitationId: z.string(),
  role: Role,
  expiresAt: z.string(),
  invitationSigningPublicKey: z.string(),
  invitationDataSignature: z.string(),
  workspaceId: z.string(),
});

export const AddMemberTransaction = z.object({
  type: z.literal("add-member"),
  memberMainDeviceSigningPublicKey: z.string(),
  role: Role,
});

export const AddMemberViaInvitationTransaction = z.object({
  type: z.literal("add-member-via-invitation"),
  role: Role,
  acceptInvitationSignature: z.string(),
  invitationSigningPublicKey: z.string(),
  invitationId: z.string(),
  memberMainDeviceSigningPublicKey: z.string(),
  workspaceId: z.string(),
  expiresAt: z.string(),
});

export const UpdateMemberTransaction = z.object({
  type: z.literal("update-member"),
  memberMainDeviceSigningPublicKey: z.string(),
  role: Role,
});

export const RemoveMemberTransaction = z.object({
  type: z.literal("remove-member"),
  memberMainDeviceSigningPublicKey: z.string(),
});

export const Author = z.object({
  publicKey: z.string(),
  signature: z.string(),
});

export const CreateChainWorkspaceChainEvent = z.object({
  authors: z.array(Author),
  transaction: CreateChainTransaction,
  prevHash: z.null(),
});

export const DefaultWorkspaceChainEvent = z.object({
  authors: z.array(Author),
  transaction: z.union([
    AddInvitationTransaction,
    AddMemberTransaction,
    AddMemberViaInvitationTransaction,
    UpdateMemberTransaction,
    RemoveMemberTransaction,
  ]),
  prevHash: z.string(),
});

export const WorkspaceChainEvent = z.union([
  CreateChainWorkspaceChainEvent,
  DefaultWorkspaceChainEvent,
]);

export const Invitation = z.object({
  role: Role,
  expiresAt: z.string(),
  invitationSigningPublicKey: z.string(),
  invitationDataSignature: z.string(),
  addedBy: z.array(z.string()),
});

export const MemberProperties = z.object({
  role: Role,
  addedBy: z.array(z.string()),
});

export const WorkspaceChainState = z.object({
  id: z.string(),
  invitations: z.record(Invitation),
  members: z.record(MemberProperties),
  lastEventHash: z.string(),
  encryptedStateClock: z.number(),
  workspaceChainVersion: z.number(),
});

export const KeyPairBase64 = z.object({
  privateKey: z.string(),
  publicKey: z.string(),
});

export type Role = z.infer<typeof Role>;
export type CreateChainTransaction = z.infer<typeof CreateChainTransaction>;
export type AddInvitationTransaction = z.infer<typeof AddInvitationTransaction>;
export type AddMemberTransaction = z.infer<typeof AddMemberTransaction>;
export type AddMemberViaInvitationTransaction = z.infer<
  typeof AddMemberViaInvitationTransaction
>;
export type UpdateMemberTransaction = z.infer<typeof UpdateMemberTransaction>;
export type RemoveMemberTransaction = z.infer<typeof RemoveMemberTransaction>;
export type Author = z.infer<typeof Author>;
export type CreateChainWorkspaceChainEvent = z.infer<
  typeof CreateChainWorkspaceChainEvent
>;
export type DefaultWorkspaceChainEvent = z.infer<
  typeof DefaultWorkspaceChainEvent
>;
export type WorkspaceChainEvent = z.infer<typeof WorkspaceChainEvent>;
export type Invitation = z.infer<typeof Invitation>;
export type MemberProperties = z.infer<typeof MemberProperties>;
export type WorkspaceChainState = z.infer<typeof WorkspaceChainState>;
export type KeyPairBase64 = z.infer<typeof KeyPairBase64>;
