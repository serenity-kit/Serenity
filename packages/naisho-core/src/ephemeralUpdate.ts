import canonicalize from "canonicalize";
import sodium, { KeyPair } from "react-native-libsodium";
import { decryptAead, encryptAead, sign, verifySignature } from "./crypto";
import { EphemeralUpdate, EphemeralUpdatePublicData } from "./types";
import {
  dateAsUint8ArrayLength,
  dateToUint8Array,
} from "./utils/dateToUint8Array";
import { extractPrefixFromUint8Array } from "./utils/extractPrefixFromUint8Array";
import { prefixWithUint8Array } from "./utils/prefixWithUint8Array";
import { uint8ArrayToDate } from "./utils/uint8ArrayToDate";

function isOlderThanTenMin(date: Date): boolean {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  return date < tenMinutesAgo;
}

export function createEphemeralUpdate(
  content,
  publicData: EphemeralUpdatePublicData,
  key: Uint8Array,
  signatureKeyPair: KeyPair
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(publicData) as string
  );
  // Each EphemeralUpdate is prefixed with the date it was created
  // to allow the recipient to know prevent reply attacks.
  const prefixedContent = prefixWithUint8Array(
    content,
    dateToUint8Array(new Date())
  );
  const { ciphertext, publicNonce } = encryptAead(
    prefixedContent,
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
  publicKey: Uint8Array,
  mostRecentEphemeralUpdateDate?: Date
) {
  const publicDataAsBase64 = sodium.to_base64(
    canonicalize(ephemeralUpdate.publicData) as string
  );

  const isValid = verifySignature(
    {
      nonce: ephemeralUpdate.nonce,
      ciphertext: ephemeralUpdate.ciphertext,
      publicData: publicDataAsBase64,
    },
    ephemeralUpdate.signature,
    publicKey
  );
  if (!isValid) {
    throw new Error("Invalid ephemeral update");
  }
  const content = decryptAead(
    sodium.from_base64(ephemeralUpdate.ciphertext),
    sodium.to_base64(canonicalize(ephemeralUpdate.publicData) as string),
    key,
    ephemeralUpdate.nonce
  );
  const { prefix, value } = extractPrefixFromUint8Array(
    content,
    dateAsUint8ArrayLength
  );
  const date = uint8ArrayToDate(prefix);
  if (isOlderThanTenMin(date)) {
    throw new Error("Ephemeral update is older than 10 minutes");
  }

  if (mostRecentEphemeralUpdateDate && date <= mostRecentEphemeralUpdateDate) {
    throw new Error(
      "Incoming ephemeral update is older or equal than a received one"
    );
  }
  return { content: value, date };
}
