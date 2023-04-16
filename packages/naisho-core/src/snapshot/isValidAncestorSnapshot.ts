import canonicalize from "canonicalize";
import { hash } from "../crypto";
import { Snapshot } from "../types";

export type SnapshotProofChainEntry = {
  parentSnapshotProof: string;
  snapshotCiphertextHash: string;
};

type IsValidAncestorSnapshotParams = {
  knownSnapshotProofEntry: SnapshotProofChainEntry;
  snapshotProofChain: SnapshotProofChainEntry[];
  currentSnapshot: Snapshot;
};

type CreateParentSnapshotProofBasedOnHashParams = {
  grandParentSnapshotProof: string;
  parentSnapshotCiphertextHash: string;
};

export function createParentSnapshotProofBasedOnHash({
  grandParentSnapshotProof,
  parentSnapshotCiphertextHash,
}: CreateParentSnapshotProofBasedOnHashParams) {
  const snapshotProofData = canonicalize({
    grandParentSnapshotProof,
    parentSnapshotCiphertext: parentSnapshotCiphertextHash,
  })!;
  const parentSnapshotProof = hash(snapshotProofData);
  return parentSnapshotProof;
}

export function isValidAncestorSnapshot({
  knownSnapshotProofEntry,
  snapshotProofChain,
  currentSnapshot,
}: IsValidAncestorSnapshotParams) {
  let isValid = true;
  if (snapshotProofChain.length === 0) {
    return false;
  }

  // check the first entry with the known entry
  const known = createParentSnapshotProofBasedOnHash({
    grandParentSnapshotProof: knownSnapshotProofEntry.parentSnapshotProof,
    parentSnapshotCiphertextHash:
      knownSnapshotProofEntry.snapshotCiphertextHash,
  });
  if (
    snapshotProofChain.length > 0 &&
    snapshotProofChain[0].parentSnapshotProof !== known
  ) {
    return false;
  }

  // check that the last chain entry matches the current snapshot
  if (
    snapshotProofChain[snapshotProofChain.length - 1].parentSnapshotProof !==
      currentSnapshot.publicData.parentSnapshotProof ||
    snapshotProofChain[snapshotProofChain.length - 1].snapshotCiphertextHash !==
      hash(currentSnapshot.ciphertext)
  ) {
    return false;
  }

  // check all items in between
  snapshotProofChain.forEach((snapshotProofChainEntry, index) => {
    const { parentSnapshotProof, snapshotCiphertextHash } =
      snapshotProofChainEntry;
    const parentSnapshotProofBasedOnHash = createParentSnapshotProofBasedOnHash(
      {
        grandParentSnapshotProof: parentSnapshotProof,
        parentSnapshotCiphertextHash: snapshotCiphertextHash,
      }
    );
    if (
      index < snapshotProofChain.length - 1 &&
      parentSnapshotProofBasedOnHash !==
        snapshotProofChain[index + 1].parentSnapshotProof
    ) {
      isValid = false;
    }
  });

  return isValid;
}
