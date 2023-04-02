import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { createParentSnapshotProof } from "./snapshot/createParentSnapshotProof";
import {
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
    `${publicNonce}${ciphertext}${publicDataAsBase64}`,
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
  publicKey: Uint8Array
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(snapshot.publicData) as string
  );

  const isValid = verifySignature(
    `${snapshot.nonce}${snapshot.ciphertext}${publicDataAsBase64}`,
    snapshot.signature,
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid snapshot");
  }
  return decryptAead(
    sodium.from_base64(snapshot.ciphertext),
    publicDataAsBase64,
    key,
    snapshot.nonce
  );
}
