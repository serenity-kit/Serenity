import { Document } from "./document";
import { KeyDerivationTrace } from "./folder";

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
  keyDerivationTrace: KeyDerivationTrace;
  clocks: number[];
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

export const formatSnapshot = (snapshot: any): Document => {
  let clocks = [];
  if (snapshot.clocks) {
    clocks = JSON.parse(snapshot.clocks);
  }
  return {
    ...snapshot,
    keyDerivationTrace: snapshot.keyDerivationTrace as KeyDerivationTrace,
    clocks,
  };
};
