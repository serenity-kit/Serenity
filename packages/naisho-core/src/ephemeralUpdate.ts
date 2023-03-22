import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { EphemeralUpdate, EphemeralUpdatePublicData } from "./types";

export function createEphemeralUpdate(
  content,
  publicData: EphemeralUpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(publicData) as string
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
    canonicalize(ephemeralUpdate.publicData) as string
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
    sodium.to_base64(canonicalize(ephemeralUpdate.publicData) as string),
    key,
    ephemeralUpdate.nonce
  );
}
