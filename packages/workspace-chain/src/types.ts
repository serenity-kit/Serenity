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

export const AcceptInvitationTransaction = z.object({
  type: z.literal("accept-invitation"),
  role: Role,
  acceptInvitationSignature: z.string(),
  invitationSigningPublicKey: z.string(),
  invitationId: z.string(),
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

export const RemoveInvitationsTransaction = z.object({
  type: z.literal("remove-invitations"),
  invitationIds: z.array(z.string()),
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

const WorkspaceChainEventBase = z.object({
  authors: z.array(Author),
  prevHash: z.string(),
});

export const AcceptInvitationWorkspaceChainEvent =
  WorkspaceChainEventBase.extend({
    transaction: AcceptInvitationTransaction,
  });

export const AddInvitationWorkspaceChainEvent = WorkspaceChainEventBase.extend({
  transaction: AddInvitationTransaction,
});

export const AddMemberWorkspaceChainEvent = WorkspaceChainEventBase.extend({
  transaction: AddMemberTransaction,
});

export const UpdateMemberWorkspaceChainEvent = WorkspaceChainEventBase.extend({
  transaction: UpdateMemberTransaction,
});

export const RemoveMemberWorkspaceChainEvent = WorkspaceChainEventBase.extend({
  transaction: RemoveMemberTransaction,
});

export const RemoveInvitationsWorkspaceChainEvent =
  WorkspaceChainEventBase.extend({
    transaction: RemoveInvitationsTransaction,
  });

export const UpdateChainWorkspaceChainEvent = z.union([
  AddInvitationWorkspaceChainEvent,
  AcceptInvitationWorkspaceChainEvent,
  AddMemberWorkspaceChainEvent,
  UpdateMemberWorkspaceChainEvent,
  RemoveMemberWorkspaceChainEvent,
  RemoveInvitationsWorkspaceChainEvent,
]);

export const WorkspaceChainEvent = z.union([
  CreateChainWorkspaceChainEvent,
  UpdateChainWorkspaceChainEvent,
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
export type AcceptInvitationTransaction = z.infer<
  typeof AcceptInvitationTransaction
>;
export type AddMemberTransaction = z.infer<typeof AddMemberTransaction>;
export type UpdateMemberTransaction = z.infer<typeof UpdateMemberTransaction>;
export type RemoveMemberTransaction = z.infer<typeof RemoveMemberTransaction>;
export type RemoveInvitationsTransaction = z.infer<
  typeof RemoveInvitationsTransaction
>;
export type Author = z.infer<typeof Author>;
export type CreateChainWorkspaceChainEvent = z.infer<
  typeof CreateChainWorkspaceChainEvent
>;
export type AcceptInvitationWorkspaceChainEvent = z.infer<
  typeof AcceptInvitationWorkspaceChainEvent
>;
export type AddInvitationWorkspaceChainEvent = z.infer<
  typeof AddInvitationWorkspaceChainEvent
>;
export type AddMemberWorkspaceChainEvent = z.infer<
  typeof AddMemberWorkspaceChainEvent
>;
export type UpdateMemberWorkspaceChainEvent = z.infer<
  typeof UpdateMemberWorkspaceChainEvent
>;
export type RemoveMemberWorkspaceChainEvent = z.infer<
  typeof RemoveMemberWorkspaceChainEvent
>;
export type RemoveInvitationsWorkspaceChainEvent = z.infer<
  typeof RemoveInvitationsWorkspaceChainEvent
>;
export type UpdateChainWorkspaceChainEvent = z.infer<
  typeof UpdateChainWorkspaceChainEvent
>;
export type WorkspaceChainEvent = z.infer<typeof WorkspaceChainEvent>;
export type Invitation = z.infer<typeof Invitation>;
export type MemberProperties = z.infer<typeof MemberProperties>;
export type WorkspaceChainState = z.infer<typeof WorkspaceChainState>;
export type KeyPairBase64 = z.infer<typeof KeyPairBase64>;
