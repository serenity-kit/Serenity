import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { Update, UpdatePublicData } from "./types";

export function createUpdate(
  content: string | Uint8Array,
  publicData: UpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  clock: number
) {
  const publicDataWithClock = {
    ...publicData,
    clock,
  };

  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(publicDataWithClock) as string
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

export function verifyAndDecryptUpdate(
  update: Update,
  key: Uint8Array,
  publicKey: Uint8Array,
  currentClock: number
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(update.publicData) as string
  );

  const isValid = verifySignature(
    `${update.nonce}${update.ciphertext}${publicDataAsBase64}`,
    update.signature,
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid signature for update");
  }

  const content = decryptAead(
    sodium.from_base64(update.ciphertext),
    sodium.to_base64(canonicalize(update.publicData) as string),
    key,
    update.nonce
  );

  if (currentClock + 1 !== update.publicData.clock) {
    throw new Error(
      `Invalid clock for the update: ${currentClock + 1} ${
        update.publicData.clock
      }`
    );
  }

  return { content, clock: update.publicData.clock };
}
