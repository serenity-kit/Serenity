import sodium, { KeyPair } from "@serenity-tools/libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { AwarenessUpdate, AwarenessUpdatePublicData } from "./types";

export function createAwarenessUpdate(
  content,
  publicData: AwarenessUpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(JSON.stringify(publicData));
  const { ciphertext, publicNonce } = encryptAead(
    content,
    publicDataAsBase64,
    sodium.to_base64(key)
  );
  const signature = sign(
    `${publicNonce}${ciphertext}${publicDataAsBase64}`,
    sodium.to_base64(signatureKeyPair.privateKey)
  );
  const awarenessUpdate: AwarenessUpdate = {
    nonce: publicNonce,
    ciphertext,
    publicData,
    signature,
  };

  return awarenessUpdate;
}

export function verifyAndDecryptAwarenessUpdate(
  update: AwarenessUpdate,
  key,
  publicKey: Uint8Array
) {
  const publicDataAsBase64 = sodium.to_base64(
    JSON.stringify(update.publicData)
  );

  const isValid = verifySignature(
    `${update.nonce}${update.ciphertext}${publicDataAsBase64}`,
    update.signature,
    sodium.to_base64(publicKey)
  );
  if (!isValid) {
    return null;
  }
  return decryptAead(
    sodium.from_base64(update.ciphertext),
    sodium.to_base64(JSON.stringify(update.publicData)),
    sodium.to_base64(key),
    update.nonce
  );
}
