import sodium from "libsodium-wrappers";
import { Snapshot } from "../types";
import { createParentSnapshotProof } from "./createParentSnapshotProof";

type IsValidParentSnapshotParams = {
  snapshot: Snapshot;
  parentSnapshotCiphertext: string;
  grandParentSnapshotProof: string;
};

export function isValidParentSnapshot({
  snapshot,
  grandParentSnapshotProof,
  parentSnapshotCiphertext,
}: IsValidParentSnapshotParams) {
  const parentSnapshotProof = createParentSnapshotProof({
    parentSnapshotCiphertext,
    grandParentSnapshotProof,
    sodium,
  });
  return parentSnapshotProof === snapshot.publicData.parentSnapshotProof;
}
