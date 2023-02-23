import { KeyDerivationTrace2 } from "@naisho/core";
import { Document } from "./document";

export type Snapshot = {
  id: string;
  latestVersion: number;
  data: string;
  document?: Document | null | undefined;
  documentId: string;
  updates?: Update[];
  activeSnapshotDocument: Document;
  createdAt: Date;
  keyDerivationTrace: KeyDerivationTrace2;
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

export const formatSnapshot = (snapshot: any): Snapshot => {
  let clocks = [];
  if (snapshot.clocks && typeof snapshot.clocks == "string") {
    clocks = JSON.parse(snapshot.clocks);
  } else {
    clocks = snapshot.clocks;
  }
  return {
    ...snapshot,
    keyDerivationTrace: snapshot.keyDerivationTrace as KeyDerivationTrace2,
    clocks,
  };
};
