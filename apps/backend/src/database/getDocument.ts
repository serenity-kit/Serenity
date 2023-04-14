import { Folder } from "../../prisma/generated/output";
import { serializeSnapshot, serializeUpdates } from "../utils/serialize";
import { prisma } from "./prisma";

export async function getDocument(
  documentId: string,
  knownSnapshotId?: string
) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      activeSnapshot: {
        include: { updates: { orderBy: { version: "asc" } } },
      },
    },
  });
  if (!doc) return null;
  let parentFolder: Folder | null = null;
  if (doc.parentFolderId) {
    parentFolder = await prisma.folder.findUnique({
      where: { id: doc.parentFolderId },
    });
  }

  let snapshotProofChain: {
    id: string;
    parentSnapshotProof: string;
    ciphertextHash: string;
  }[] = [];
  if (knownSnapshotId) {
    snapshotProofChain = await prisma.snapshot.findMany({
      where: { documentId },
      cursor: { id: knownSnapshotId },
      skip: 1,
      select: {
        id: true,
        parentSnapshotProof: true,
        ciphertextHash: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  const snapshot = doc.activeSnapshot
    ? serializeSnapshot(doc.activeSnapshot)
    : null;

  const updates = doc.activeSnapshot
    ? serializeUpdates(doc.activeSnapshot.updates)
    : [];

  return {
    doc: {
      id: doc.id,
      parentFolderId: doc.parentFolderId,
      workspaceKeyId: doc.workspaceKeyId,
      workspaceId: doc.workspaceId,
    },
    parentFolder: {
      id: parentFolder?.id,
      parentFolderId: parentFolder?.parentFolderId,
      subkeyId: parentFolder?.subkeyId, // TODO: remove
      keyDerivationTrace: parentFolder?.keyDerivationTrace,
    },
    snapshot,
    updates,
    snapshotProofChain: snapshotProofChain.map((snapshotProofChainEntry) => {
      return {
        id: snapshotProofChainEntry.id,
        parentSnapshotProof: snapshotProofChainEntry.parentSnapshotProof,
        snapshotCiphertextHash: snapshotProofChainEntry.ciphertextHash,
      };
    }),
  };
}
