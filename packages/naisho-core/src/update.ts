import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { Update, UpdatePublicData } from "./types";

const clocksPerSnapshot = {};
const updatesInProgress = {};

export function addUpdateToInProgressQueue(update: Update, rawUpdate: any) {
  if (updatesInProgress[update.publicData.docId] === undefined) {
    updatesInProgress[update.publicData.docId] = {};
  }
  updatesInProgress[update.publicData.docId][
    `${update.publicData.refSnapshotId}-${update.publicData.clock}`
  ] = rawUpdate;
}

export function removeUpdateFromInProgressQueue(
  documentId: string,
  snapshotId: string,
  clock: number
) {
  delete updatesInProgress[documentId][`${snapshotId}-${clock}`];
}

export function getUpdateInProgress(
  documentId: string,
  snapshotId: string,
  clock: number
) {
  return updatesInProgress[documentId][`${snapshotId}-${clock}`];
}

export function createUpdate(
  content: string | Uint8Array,
  publicData: UpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  clockOverwrite?: number
) {
  // update the clock for the current keypair
  if (clockOverwrite === undefined) {
    if (
      clocksPerSnapshot[publicData.refSnapshotId] &&
      clocksPerSnapshot[publicData.refSnapshotId][publicData.pubKey] !==
        undefined
    ) {
      clocksPerSnapshot[publicData.refSnapshotId][publicData.pubKey] =
        clocksPerSnapshot[publicData.refSnapshotId][publicData.pubKey] + 1;
    } else {
      if (clocksPerSnapshot[publicData.refSnapshotId] === undefined) {
        clocksPerSnapshot[publicData.refSnapshotId] = {};
      }
      clocksPerSnapshot[publicData.refSnapshotId][publicData.pubKey] = 0;
    }
  }

  const publicDataWithClock = {
    ...publicData,
    clock:
      clockOverwrite !== undefined
        ? clockOverwrite
        : clocksPerSnapshot[publicData.refSnapshotId][publicData.pubKey],
  };

  const publicDataAsBase64 = sodium.to_base64(
    JSON.stringify(publicDataWithClock)
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

  const update: Update = {
    nonce: publicNonce,
    ciphertext: ciphertext,
    publicData: publicDataWithClock,
    signature,
  };

  return update;
}

export function verifyAndDecryptUpdate(update: Update, key, publicKey) {
  const publicDataAsBase64 = sodium.to_base64(
    JSON.stringify(update.publicData)
  );

  const isValid = verifySignature(
    `${update.nonce}${update.ciphertext}${publicDataAsBase64}`,
    update.signature,
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid signature for update");
  }

  // verify the updates per public key start with 0 and come in ordered
  if (!clocksPerSnapshot[update.publicData.refSnapshotId]) {
    clocksPerSnapshot[update.publicData.refSnapshotId] = {};
  }
  if (
    clocksPerSnapshot[update.publicData.refSnapshotId][
      update.publicData.pubKey
    ] !== undefined
  ) {
    if (
      clocksPerSnapshot[update.publicData.refSnapshotId][
        update.publicData.pubKey
      ] +
        1 !==
      update.publicData.clock
    ) {
      throw new Error("Invalid update");
    }
  } else {
    if (update.publicData.clock !== 0) {
      throw new Error("Invalid update");
    }
  }

  const result = decryptAead(
    sodium.from_base64(update.ciphertext),
    sodium.to_base64(JSON.stringify(update.publicData)),
    key,
    update.nonce
  );

  clocksPerSnapshot[update.publicData.refSnapshotId][update.publicData.pubKey] =
    update.publicData.clock;
  return result;
}

// TODO snapshot refs should be stored per document to allow per document cleanup
// and ideally the documents should be cached for quick access
export async function cleanupUpdates() {
  Object.keys(clocksPerSnapshot).forEach((snapshotId) => {
    delete clocksPerSnapshot[snapshotId];
  });
}
