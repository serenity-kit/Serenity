import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { AwarenessUpdate, AwarenessUpdatePublicData } from "./types";

export async function createAwarenessUpdate(
  content,
  publicData: AwarenessUpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(JSON.stringify(publicData));
  const { ciphertext, publicNonce } = await encryptAead(
    content,
    publicDataAsBase64,
    key
  );
  const signature = await sign(
    `${publicNonce}${ciphertext}${publicDataAsBase64}`,
    signatureKeyPair.privateKey
  );
  const awarenessUpdate: AwarenessUpdate = {
    nonce: publicNonce,
    ciphertext,
    publicData,
    signature,
  };

  return awarenessUpdate;
}

export async function verifyAndDecryptAwarenessUpdate(
  update: AwarenessUpdate,
  key,
  publicKey: Uint8Array
) {
  const publicDataAsBase64 = sodium.to_base64(
    JSON.stringify(update.publicData)
  );

  const isValid = await verifySignature(
    `${update.nonce}${update.ciphertext}${publicDataAsBase64}`,
    update.signature,
    publicKey
  );
  if (!isValid) {
    return null;
  }
  return await decryptAead(
    sodium.from_base64(update.ciphertext),
    sodium.to_base64(JSON.stringify(update.publicData)),
    key,
    update.nonce
  );
}
