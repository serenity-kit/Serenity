import { KeyDerivationTrace2 } from "@naisho/core";
import {
  Snapshot as PrismaSnapshot,
  Update as PrismaUpdate,
} from "../../prisma/generated/output";

export type Snapshot = PrismaSnapshot & {
  keyDerivationTrace: KeyDerivationTrace2;
  clocks: number[];
};

export type Update = PrismaUpdate;

export const formatSnapshot = (snapshot: PrismaSnapshot): Snapshot => {
  let clocks: number[] = [];
  if (snapshot.clocks && typeof snapshot.clocks == "string") {
    clocks = JSON.parse(snapshot.clocks);
  }
  return {
    ...snapshot,
    keyDerivationTrace: snapshot.keyDerivationTrace as KeyDerivationTrace2,
    clocks,
  };
};
