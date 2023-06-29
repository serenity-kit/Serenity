import {
  createInitialSnapshot,
  SnapshotPublicData,
} from "@serenity-tools/secsync";
import sodium, { KeyPair } from "react-native-libsodium";
import { generateId } from "../generateId/generateId";
import { LocalDevice } from "../types";
import { KeyDerivationTrace, SerenitySnapshotPublicData } from "../zodTypes";

// created using:
// const yDocState = Yjs.encodeStateAsUpdateV2(yDocRef.current);
// console.log(sodium.to_base64(yDocState));
const introductionDocument = `AAMAAw8QzpCuyBJPsPm1iBCOkK7IElABAAREHgJCOnq-AQJCTAAfAGAqCDQCxAKQAtACAQGCAwIAAiQYAsABkgEAzgGQAQsAGCIa6gG0AQACBEbIAwCQBQAERAA0AwFEFgMABgIgAhOYAZQBtgEMBwAglAH0AZYEAIQCmQEHACgABwAEAIcABwAEAIEAAACHAAAAxwAHAAQAKACBAAcABACBAIcAgQCEAIEAhADBAIQAwQAAAMEAAADBAAAAxwAHASEAAQAAAEcABACBAIQAhwAHACgAqAABAAAARwAEAIEAhACBAIQAhwAHACgABwAEAIEAAADBAAAAxwAoAAcABADBAMcABwIEAIcABwEEAIEAhACBAITAA5MDcGFnZWhlYWRpbmdsZXZlbEludHJvZHVjdGlvbnBhcmFncmFwaFdlbGNvbWUgdG8geW91ciBmaXJzdCBwYWdlIXBhcmFncmFwaGhlYWRpbmdMaXN0c2xldmVsWW91IGNhbiBjcmVhdGUgcGFyYWdyYXBoYnVsbGV0LCBudW1iZXJlZCBhbmQgY2hlY2stbGlzdHMgZS5nLnRhc2tMaXN0dGFza0l0ZW1wYXJhZ3JhcGhjaGVja2VkU2lnbiB1cCBmb3IgU2VyZW5pdHl0YXNrSXRlbXBhcmFncmFwaGNoZWNrZWRSZWFkIHRoZSBJbnRyb2R1Y3Rpb24gcGFnZXRhc2tJdGVtcGFyYWdyYXBoY2hlY2tlZENyZWF0ZSB5b3VyIG93biBwYWdlaGVhZGluZ2xldmVsSGlnaGxpZ2h0cyBvZiBTZXJlbml0eWJ1bGxldExpc3RsaXN0SXRlbXBhcmFncmFwaEdyZWF0IFVYbGlzdEl0ZW1wYXJhZ3JhcGhFbmQtdG8tZW5kIGVuY3J5cHRlZAQHBQwJGwkHRQAPCRoGBUgACQcMSAAJBwURBAgJBxQHBRYKCAlIAAkDEAEDAQAAGQMGAwZDAEYAQwIGQwAGQwAGAwZDAQZDAAYdQQAbBUEABQNBAQIBAgELQQAPQQMMDUEAAgEoQQICUAB9AX0CeXh5fQIBAAGOiJekCREsGwEECAAQBAECGgAGAAURAxANAAwBBgsRDBwrGQASABAA`;

export const createIntroductionDocumentSnapshot = ({
  documentId,
  snapshotEncryptionKey,
  keyDerivationTrace,
  device,
}: {
  documentId: string;
  snapshotEncryptionKey: Uint8Array;
  keyDerivationTrace: KeyDerivationTrace;
  device: LocalDevice;
}) => {
  const signatureKeyPair: KeyPair = {
    keyType: "ed25519",
    publicKey: sodium.from_base64(device.signingPublicKey),
    privateKey: sodium.from_base64(device.signingPrivateKey),
  };

  const publicData: SnapshotPublicData & SerenitySnapshotPublicData = {
    snapshotId: generateId(),
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    parentSnapshotClocks: {},
  };

  return createInitialSnapshot(
    sodium.from_base64(introductionDocument),
    publicData,
    snapshotEncryptionKey,
    signatureKeyPair,
    sodium
  );
};
