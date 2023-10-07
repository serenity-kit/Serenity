import { GetDocumentParams } from "@serenity-tools/secsync";
import { Prisma } from "../../prisma/generated/output";
import { serializeSnapshot, serializeUpdates } from "../utils/serialize";
import { prisma } from "./prisma";

export async function getUpdatesForDocument({
  documentId,
  lastKnownUpdateServerVersion,
  lastKnownSnapshotId,
}: GetDocumentParams) {
  return prisma.$transaction(
    async (prisma) => {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          activeSnapshot: {
            include: {
              updates: {
                orderBy: { version: "asc" },
                where: { version: { gt: lastKnownUpdateServerVersion } },
              },
            },
          },
        },
      });

      if (document === null) {
        throw new Error("Document not found.");
      }
      if (document.activeSnapshot === null) {
        throw new Error("Document has no active snapshot.");
      }

      let snapshotProofChain: {
        id: string;
        parentSnapshotProof: string;
        ciphertextHash: string;
      }[] = [];
      if (lastKnownSnapshotId) {
        snapshotProofChain = await prisma.snapshot.findMany({
          where: { documentId },
          cursor: { id: lastKnownSnapshotId },
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

      return {
        snapshot: serializeSnapshot(document.activeSnapshot),
        updates: serializeUpdates(document.activeSnapshot.updates),
        snapshotProofChain: snapshotProofChain.map(
          (snapshotProofChainEntry) => {
            return {
              id: snapshotProofChainEntry.id,
              parentSnapshotProof: snapshotProofChainEntry.parentSnapshotProof,
              snapshotCiphertextHash: snapshotProofChainEntry.ciphertextHash,
            };
          }
        ),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
