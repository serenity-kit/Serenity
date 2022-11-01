import { Folder } from "../../prisma/generated/output";
import { serializeSnapshot, serializeUpdates } from "../utils/serialize";
import { prisma } from "./prisma";

export async function getDocument(documentId: string) {
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
    },
    parentFolder: {
      id: parentFolder?.id,
      parentFolderId: parentFolder?.parentFolderId,
      subkeyId: parentFolder?.subkeyId,
      keyDerivationTrace: parentFolder?.keyDerivationTrace,
    },
    snapshot,
    updates,
  };
}
