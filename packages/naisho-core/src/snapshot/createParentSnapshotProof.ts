import canonicalize from "canonicalize";
import { hash } from "../crypto";

type CreateParentSnapshotProofParams = {
  grandParentSnapshotProof: string;
  parentSnapshotCiphertext: string;
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
