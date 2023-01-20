import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { Snapshot, SnapshotPublicData } from "./types";

type PendingResult =
  | { type: "snapshot" }
  | { type: "updates"; rawUpdates: any[] }
  | { type: "none" };

const snapshotsInProgress = {};
const pendingSnapshot = {};
const pendingUpdates = {};

export function addSnapshotToInProgress(snapshot: Snapshot) {
  snapshotsInProgress[snapshot.publicData.docId] = snapshot;
}

export function removeSnapshotInProgress(documentId: string) {
  delete snapshotsInProgress[documentId];
}

export function getSnapshotInProgress(documentId: string) {
  return snapshotsInProgress[documentId];
}

export function addPendingSnapshot(documentId: string) {
  pendingSnapshot[documentId] = true;
}

export function addPendingUpdate(documentId, rawUpdate: any) {
  if (pendingUpdates[documentId] === undefined) {
    pendingUpdates[documentId] = [];
  }
  pendingUpdates[documentId].push(rawUpdate);
}

export function removePending(documentId) {
  delete pendingSnapshot[documentId];
  delete pendingUpdates[documentId];
}

export function getPending(documentId): PendingResult {
  if (pendingSnapshot[documentId]) {
    return { type: "snapshot" };
  } else if (
    Array.isArray(pendingUpdates[documentId]) &&
    pendingUpdates[documentId].length > 0
  ) {
    return { type: "updates", rawUpdates: pendingUpdates[documentId] };
  }
  return { type: "none" };
}

export async function createSnapshot(
  content,
  publicData: SnapshotPublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(publicData) as string
  );

  const { ciphertext, publicNonce } = await encryptAead(
    content,
    publicDataAsBase64,
    key
  );
  const signature = await sign(
    `${publicNonce}${ciphertext}${publicDataAsBase64}`,
    signatureKeyPair.privateKey
  );
  const snapshot: Snapshot = {
    nonce: publicNonce,
    ciphertext,
    publicData,
    signature,
  };

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
