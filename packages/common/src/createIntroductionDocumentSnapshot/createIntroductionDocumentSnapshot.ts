import { createInitialSnapshot, SnapshotPublicData } from "@naisho/core";
import sodium, { KeyPair } from "react-native-libsodium";
import { generateId } from "../generateId/generateId";
import { LocalDevice } from "../types";
import { KeyDerivationTrace, SerenitySnapshotPublicData } from "../zodTypes";

// created using:
// const yDocState = Yjs.encodeStateAsUpdate(yDocRef.current);
// console.log(sodium.to_base64(yDocState));
const introductionDocument = `AlCOiJekCQAHAQRwYWdlAwdoZWFkaW5nKACOiJekCQAFbGV2ZWwBfQEHAI6Il6QJAAYEAI6Il6QJAgxJbnRyb2R1Y3Rpb26HjoiXpAkAAwlwYXJhZ3JhcGgHAI6Il6QJDwYEAI6Il6QJEBtXZWxjb21lIHRvIHlvdXIgZmlyc3QgcGFnZSGBjoiXpAkPAQAbh46Il6QJLAMJcGFyYWdyYXBoAAXHjoiXpAkPjoiXpAksAwdoZWFkaW5nBwCOiJekCU4GBACOiJekCU8FTGlzdHMoAI6Il6QJTgVsZXZlbAF9AoGOiJekCUgBBwCOiJekCUgGBACOiJekCVcPWW91IGNhbiBjcmVhdGUggY6Il6QJZgWHjoiXpAlWAwlwYXJhZ3JhcGiBjoiXpAlrA4SOiJekCW8aYnVsbGV0LCBudW1iZXJlZCBhbmQgY2hlY2uBjoiXpAmJAQGEjoiXpAmKAQYtbGlzdHPBjoiXpAlIjoiXpAlWAYSOiJekCZABBSBlLmcuwY6Il6QJSI6Il6QJkQEBAALBjoiXpAlIjoiXpAmXAQEAAsGOiJekCUiOiJekCZoBAQALx46Il6QJSI6Il6QJnQEDCHRhc2tMaXN0BwCOiJekCakBAwh0YXNrSXRlbQcAjoiXpAmqAQMJcGFyYWdyYXBoIQCOiJekCaoBB2NoZWNrZWQBAQCOiJekCasBAQAPR46Il6QJrQEGBACOiJekCb0BDFNpZ24gdXAgZm9yIIGOiJekCckBAYSOiJekCcoBCFNlcmVuaXR5h46Il6QJqgEDCHRhc2tJdGVtBwCOiJekCdMBAwlwYXJhZ3JhcGgoAI6Il6QJ0wEHY2hlY2tlZAF5qI6Il6QJrAEBeAEAjoiXpAnUAQEAAUeOiJekCdcBBgQAjoiXpAnZAQVSZWFkIIGOiJekCd4BDISOiJekCeoBEXRoZSBJbnRyb2R1Y3Rpb24ggY6Il6QJ-wENhI6Il6QJiAIEcGFnZYeOiJekCdMBAwh0YXNrSXRlbQcAjoiXpAmNAgMJcGFyYWdyYXBoKACOiJekCY0CB2NoZWNrZWQBeQcAjoiXpAmOAgYEAI6Il6QJkAIUQ3JlYXRlIHlvdXIgb3duIHBhZ2WBjoiXpAmNAgEAAsGOiJekCakBjoiXpAmdAQEAKMeOiJekCakBjoiXpAmoAgMHaGVhZGluZygAjoiXpAnRAgVsZXZlbAF9AgcAjoiXpAnRAgYEAI6Il6QJ0wIWSGlnaGxpZ2h0cyBvZiBTZXJlbml0ecGOiJekCdECjoiXpAmoAgHHjoiXpAnRAo6Il6QJ6gIDCmJ1bGxldExpc3QHAI6Il6QJ6wIDCGxpc3RJdGVtBwCOiJekCewCAwlwYXJhZ3JhcGgHAI6Il6QJ7QIGBACOiJekCe4CCEdyZWF0IFVYh46Il6QJ7AIDCGxpc3RJdGVtBwCOiJekCfcCAwlwYXJhZ3JhcGgHAI6Il6QJ-AIGBACOiJekCfkCA0VuZIGOiJekCfwCAYSOiJekCf0CEC10by1lbmQgZW5jcnlwdGWEjoiXpAmNAwFkAfD8moQIAISOiJekCY4DAWQBjoiXpAkRLBxJBVYBZwVtA4oBAZEBAZcBEqwBEcoBAdcBAt8BDPwBDaUCLOoCAf0CAY4DAQ`;

export const createIntroductionDocumentSnapshot = ({
  documentId,
  snapshotEncryptionKey,
  subkeyId,
  keyDerivationTrace,
  device,
}: {
  documentId: string;
  snapshotEncryptionKey: Uint8Array;
  subkeyId: number;
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
    subkeyId,
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
