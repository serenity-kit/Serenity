import { Snapshot } from "../types";
import { createParentSnapshotProof } from "./createParentSnapshotProof";

type IsValidParentSnapshotParams = {
  snapshot: Snapshot;
  parentSnapshotCiphertext: Uint8Array;
  grandParentSnapshotProof: Uint8Array;
};

export function isValidParentSnapshot({
  snapshot,
  grandParentSnapshotProof,
  parentSnapshotCiphertext,
}: IsValidParentSnapshotParams) {
  const parentSnapshotProof = createParentSnapshotProof({
    parentSnapshotCiphertext,
    grandParentSnapshotProof,
  });
  return parentSnapshotProof === snapshot.publicData.parentSnapshotProof;
}
