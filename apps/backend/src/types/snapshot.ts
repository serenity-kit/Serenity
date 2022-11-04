import { Document } from "./document";
import { KeyDerivationTrace } from "./folder";

export type Clocks = {
  [publicKey: string]: number;
};
export type Snapshot = {
  id: string;
  latestVersion: number;
  data: string;
  preview: string;
  document?: Document | null | undefined;
  documentId: string;
  updates?: Update[];
  activeSnapshotDocument: Document;
  createdAt: Date;
  subkeyId: number;
  keyDerivationTrace: KeyDerivationTrace;
  clocks: Clocks;
};

export type Update = {
  id: string;
  version: number;
  data: string;
  snapshot?: Snapshot | null | undefined;
  snapshotId: string;
  snapshotVersion: number;
  pubKey: string;
};

export const formatSnapshot = (snapshot: any): Snapshot => {
  return {
    ...snapshot,
    keyDerivationTrace: snapshot.keyDerivationTrace as KeyDerivationTrace,
  };
};
