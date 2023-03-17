import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { EphemeralUpdate, EphemeralUpdatePublicData } from "./types";

export function createEphemeralUpdate(
  content,
  publicData: EphemeralUpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(JSON.stringify(publicData));
  const { ciphertext, publicNonce } = encryptAead(
    content,
    publicDataAsBase64,
    key
  );
  const signature = sign(
    `${publicNonce}${ciphertext}${publicDataAsBase64}`,
    signatureKeyPair.privateKey
  );
  const ephemeralUpdate: EphemeralUpdate = {
    nonce: publicNonce,
    ciphertext,
    publicData,
    signature,
  };

  return ephemeralUpdate;
}

export function verifyAndDecryptEphemeralUpdate(
  ephemeralUpdate: EphemeralUpdate,
  key,
  publicKey: Uint8Array
) {
  const publicDataAsBase64 = sodium.to_base64(
    JSON.stringify(ephemeralUpdate.publicData)
  );

  const isValid = verifySignature(
    `${ephemeralUpdate.nonce}${ephemeralUpdate.ciphertext}${publicDataAsBase64}`,
    ephemeralUpdate.signature,
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid ephemeral update");
  }
  return decryptAead(
    sodium.from_base64(ephemeralUpdate.ciphertext),
    sodium.to_base64(JSON.stringify(ephemeralUpdate.publicData)),
    key,
    ephemeralUpdate.nonce
  );
}
