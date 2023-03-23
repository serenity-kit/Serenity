export type Permission = "canAddMembers" | "canRemoveMembers";

export type CreateChainTransaction = {
  type: "create";
  id: string;
  lockboxPublicKeys: { [signingPublicKey: string]: string };
};

export type AddMemberTransaction =
  | {
      type: "add-member";
      memberSigningPublicKey: string;
      memberLockboxPublicKey: string;
      isAdmin: true;
      canAddMembers: true;
      canRemoveMembers: true;
    }
  | {
      type: "add-member";
      memberSigningPublicKey: string;
      memberLockboxPublicKey: string;
      isAdmin: false;
      canAddMembers: boolean;
      canRemoveMembers: boolean;
    };

export type UpdateMemberTransaction =
  | {
      type: "update-member";
      memberSigningPublicKey: string;
      isAdmin: true;
      canAddMembers: true;
      canRemoveMembers: true;
    }
  | {
      type: "update-member";
      memberSigningPublicKey: string;
      isAdmin: false;
      canAddMembers: boolean;
      canRemoveMembers: boolean;
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

export type MemberAuthorization =
  | {
      isAdmin: true;
      canAddMembers: true;
      canRemoveMembers: true;
    }
  | {
      isAdmin: false;
      canAddMembers: boolean;
      canRemoveMembers: boolean;
    };

export type MemberProperties =
  | {
      lockboxPublicKey: string;
      isAdmin: true;
      canAddMembers: true;
      canRemoveMembers: true;
      addedBy: string[];
      name?: string;
      profileUpdatedBy?: string;
    }
  | {
      lockboxPublicKey: string;
      isAdmin: false;
      canAddMembers: boolean;
      canRemoveMembers: boolean;
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

// encrypted state

export type Key = {
  keyId: string;
  key: string;
};

export type EncryptedState = {
  ciphertext: string;
  nonce: string;
  keyId: string;
  publicData: { clock: number };
  author: Author;
};

export type EncryptedMemberStateUpdate = {
  name: string;
};

export type RawEncryptedStateUpdate = {
  members: { [publicKey: string]: EncryptedMemberStateUpdate };
};

export type EncryptedStateUpdate = {
  members: { [publicKey: string]: EncryptedMemberStateUpdate };
  hash: string; // this hash ensures that all participants end up with the same state
  // TODO add the chain hash as well to ensure integrity?
};

export type Lockbox = {
  receiverSigningPublicKey: string;
  senderLockboxPublicKey: string;
  ciphertext: string;
  nonce: string;
};
