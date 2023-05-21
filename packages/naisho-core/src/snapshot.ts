import canonicalize from "canonicalize";
import type { KeyPair } from "libsodium-wrappers";
import { decryptAead } from "./crypto/decryptAead";
import { encryptAead } from "./crypto/encryptAead";
import { sign } from "./crypto/sign";
import { verifySignature } from "./crypto/verifySignature";
import { createParentSnapshotProof } from "./snapshot/createParentSnapshotProof";
import { isValidParentSnapshot } from "./snapshot/isValidParentSnapshot";
import {
  ParentSnapshotProofInfo,
  Snapshot,
  SnapshotPublicData,
  SnapshotPublicDataWithParentSnapshotProof,
} from "./types";

export function createSnapshot<AdditionalSnapshotPublicData>(
  content: Uint8Array | string,
  publicData: SnapshotPublicData & AdditionalSnapshotPublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  parentSnapshotCiphertext: string,
  grandParentSnapshotProof: string,
  sodium: typeof import("libsodium-wrappers")
) {
  const extendedPublicData: SnapshotPublicDataWithParentSnapshotProof &
    AdditionalSnapshotPublicData = {
    ...publicData,
    parentSnapshotProof: createParentSnapshotProof({
      parentSnapshotCiphertext,
      grandParentSnapshotProof,
      sodium,
    }),
  };

  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(extendedPublicData) as string
  );

  const { ciphertext, publicNonce } = encryptAead(
    content,
    publicDataAsBase64,
    key,
    sodium
  );
  const signature = sign(
    {
      nonce: publicNonce,
      ciphertext,
      publicData: publicDataAsBase64,
    },
    signatureKeyPair.privateKey,
    sodium
  );
  const snapshot: Snapshot & {
    publicData: AdditionalSnapshotPublicData & Snapshot["publicData"];
  } = {
    nonce: publicNonce,
    ciphertext,
    publicData: extendedPublicData,
    signature,
  };

  return snapshot;
}

export function createInitialSnapshot<AdditionalSnapshotPublicData>(
  content: Uint8Array | string,
  publicData: SnapshotPublicData & AdditionalSnapshotPublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  sodium: typeof import("libsodium-wrappers")
) {
  const snapshot = createSnapshot<AdditionalSnapshotPublicData>(
    content,
    publicData,
    key,
    signatureKeyPair,
    "",
    "",
    sodium
  );
  return snapshot;
}

export function verifyAndDecryptSnapshot(
  snapshot: Snapshot,
  key: Uint8Array,
  publicKey: Uint8Array,
  currentClientPublicKey: Uint8Array,
  sodium: typeof import("libsodium-wrappers"),
  parentSnapshotProofInfo?: ParentSnapshotProofInfo,
  parentSnapshotUpdateClock?: number
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(snapshot.publicData) as string
  );

  const isValid = verifySignature(
    {
      nonce: snapshot.nonce,
      ciphertext: snapshot.ciphertext,
      publicData: publicDataAsBase64,
    },
    snapshot.signature,
    publicKey,
    sodium
  );
  if (!isValid) {
    throw new Error("Invalid snapshot");
  }

  if (parentSnapshotProofInfo) {
    const isValid = isValidParentSnapshot({
      snapshot,
      parentSnapshotCiphertext: parentSnapshotProofInfo.ciphertext,
      grandParentSnapshotProof: parentSnapshotProofInfo.parentSnapshotProof,
      sodium,
    });
    if (!isValid) {
      throw new Error("Invalid parent snapshot verification");
    }
  }

  if (parentSnapshotUpdateClock) {
    const currentClientPublicKeyString = sodium.to_base64(
      currentClientPublicKey
    );

    if (
      snapshot.publicData.parentSnapshotClocks[currentClientPublicKeyString] !==
        undefined &&
      parentSnapshotUpdateClock ===
        snapshot.publicData.parentSnapshotClocks[currentClientPublicKeyString]
    ) {
      throw new Error("Invalid updateClock for the parent snapshot");
    }
  }

  return decryptAead(
    sodium.from_base64(snapshot.ciphertext),
    publicDataAsBase64,
    key,
    snapshot.nonce,
    sodium
  );
}
