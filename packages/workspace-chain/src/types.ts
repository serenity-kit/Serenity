import z from "zod";

export const Role = z.enum(["ADMIN", "EDITOR", "COMMENTER", "VIEWER"]);

export type Role = z.infer<typeof Role>;

export type CreateChainTransaction = {
  type: "create";
  id: string;
};

export type AddInvitationTransaction = {
  type: "add-invitation";
  invitationId: string;
  role: Role;
  expiresAt: string;
  invitationSigningPublicKey: string;
  invitationDataSignature: string;
  workspaceId: string;
};

export type AddMemberTransaction = {
  type: "add-member";
  memberMainDeviceSigningPublicKey: string;
  role: Role;
};

export type AddMemberViaInvitationTransaction = {
  type: "add-member-via-invitation";
  role: Role;
  acceptInvitationSignature: string;
  invitationSigningPublicKey: string;
  invitationId: string;
  memberMainDeviceSigningPublicKey: string;
  workspaceId: string;
  expiresAt: string;
};

export type UpdateMemberTransaction = {
  type: "update-member";
  memberMainDeviceSigningPublicKey: string;
  role: Role;
};

export type RemoveMemberTransaction = {
  type: "remove-member";
  memberMainDeviceSigningPublicKey: string;
};

export type Author = {
  publicKey: string;
  signature: string;
};

export type CreateChainTrustChainEvent = {
  authors: Author[];
  transaction: CreateChainTransaction;
  prevHash: null;
};

export type DefaultTrustChainEvent = {
  authors: Author[];
  transaction:
    | AddInvitationTransaction
    | AddMemberTransaction
    | AddMemberViaInvitationTransaction
    | UpdateMemberTransaction
    | RemoveMemberTransaction;
  prevHash: string;
};

export type TrustChainEvent =
  | CreateChainTrustChainEvent
  | DefaultTrustChainEvent;

export type Invitation = {
  role: Role;
  expiresAt: string;
  invitationSigningPublicKey: string;
  invitationDataSignature: string;
  addedBy: string[];
};

export type MemberProperties = {
  role: Role;
  addedBy: string[];
};

export type TrustChainState = {
  id: string;
  invitations: { [invitationId: string]: Invitation };
  members: { [publicKey: string]: MemberProperties };
  lastEventHash: string;
  encryptedStateClock: number;
  trustChainVersion: number; // allows to know when to recompute the state after a bug fix
};

export type KeyPairBase64 = {
  privateKey: string;
  publicKey: string;
};
