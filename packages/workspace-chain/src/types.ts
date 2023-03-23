export type Role = "ADMIN" | "EDITOR" | "COMMENTER" | "VIEWER";

export type CreateChainTransaction = {
  type: "create";
  id: string;
  lockboxPublicKeys: { [signingPublicKey: string]: string };
};

export type AddMemberTransaction = {
  type: "add-member";
  memberSigningPublicKey: string;
  memberLockboxPublicKey: string;
  role: Role;
};

export type UpdateMemberTransaction = {
  type: "update-member";
  memberSigningPublicKey: string;
  role: Role;
};

export type RemoveMemberTransaction = {
  type: "remove-member";
  memberSigningPublicKey: string;
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
    | AddMemberTransaction
    | UpdateMemberTransaction
    | RemoveMemberTransaction;
  prevHash: string;
};

export type TrustChainEvent =
  | CreateChainTrustChainEvent
  | DefaultTrustChainEvent;

export type MemberProperties = {
  lockboxPublicKey: string;
  role: Role;
  addedBy: string[];
  name?: string;
  profileUpdatedBy?: string;
};

export type TrustChainState = {
  id: string;
  // TODO split up into a better structure
  members: { [publicKey: string]: MemberProperties };
  lastEventHash: string;
  encryptedStateClock: number;
  trustChainVersion: number; // allows to know when to recompute the state after a bug fix
};

export type KeyPairBase64 = {
  privateKey: string;
  publicKey: string;
};
