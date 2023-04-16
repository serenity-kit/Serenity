import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { createParentSnapshotProof } from "./snapshot/createParentSnapshotProof";
import { isValidParentSnapshot } from "./snapshot/isValidParentSnapshot";
import {
  ParentSnapshotProofInfo,
  Snapshot,
  SnapshotPublicData,
  SnapshotPublicDataWithParentSnapshotProof,
} from "./types";

export function createSnapshot(
  content: Uint8Array | string,
  publicData: SnapshotPublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  parentSnapshotCiphertext: string,
  grandParentSnapshotProof: string
) {
  const extendedPublicData: SnapshotPublicDataWithParentSnapshotProof = {
    ...publicData,
    parentSnapshotProof: createParentSnapshotProof({
      parentSnapshotCiphertext,
      grandParentSnapshotProof,
    }),
  };

  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(extendedPublicData) as string
  );

  const { ciphertext, publicNonce } = encryptAead(
    content,
    publicDataAsBase64,
    key
  );
  const signature = sign(
    {
      nonce: publicNonce,
      ciphertext,
      publicData: publicDataAsBase64,
    },
    signatureKeyPair.privateKey
  );
  const snapshot: Snapshot = {
    nonce: publicNonce,
    ciphertext,
    publicData: extendedPublicData,
    signature,
  };

  return snapshot;
}

export function createInitialSnapshot(
  content: Uint8Array | string,
  publicData: SnapshotPublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const snapshot = createSnapshot(
    content,
    publicData,
    key,
    signatureKeyPair,
    "",
    ""
  );
  return snapshot;
}

export function verifyAndDecryptSnapshot(
  snapshot: Snapshot,
  key: Uint8Array,
  publicKey: Uint8Array,
  currentClientPublicKey: Uint8Array,
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
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid snapshot");
  }

  if (parentSnapshotProofInfo) {
    const isValid = isValidParentSnapshot({
      snapshot,
      parentSnapshotCiphertext: parentSnapshotProofInfo.ciphertext,
      grandParentSnapshotProof: parentSnapshotProofInfo.parentSnapshotProof,
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
    snapshot.nonce
  );
}
