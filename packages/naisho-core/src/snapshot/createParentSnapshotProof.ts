import canonicalize from "canonicalize";
import { hash } from "../crypto";

type CreateParentSnapshotProofParams = {
  grandParentSnapshotProof: Uint8Array;
  parentSnapshotCiphertext: Uint8Array;
};

export function createParentSnapshotProof({
  grandParentSnapshotProof,
  parentSnapshotCiphertext,
}: CreateParentSnapshotProofParams) {
  const snapshotProofData = canonicalize({
    grandParentSnapshotProof,
    parentSnapshotCiphertext: hash(parentSnapshotCiphertext),
  })!;
  const parentSnapshotProof = hash(snapshotProofData);
  return parentSnapshotProof;
}
