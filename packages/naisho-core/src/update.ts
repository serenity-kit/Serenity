import canonicalize from "canonicalize";
import { KeyPair } from "libsodium-wrappers";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { Update, UpdatePublicData } from "./types";

export function createUpdate(
  content: string | Uint8Array,
  publicData: UpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair,
  clock: number,
  sodium: typeof import("libsodium-wrappers")
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
  currentClock: number,
  sodium: typeof import("libsodium-wrappers")
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(update.publicData) as string
  );

  const isValid = verifySignature(
    {
      nonce: update.nonce,
      ciphertext: update.ciphertext,
      publicData: publicDataAsBase64,
    },
    update.signature,
    publicKey,
    sodium
  );
  if (!isValid) {
    throw new Error("Invalid signature for update");
  }

  const content = decryptAead(
    sodium.from_base64(update.ciphertext),
    sodium.to_base64(canonicalize(update.publicData) as string),
    key,
    update.nonce,
    sodium
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
