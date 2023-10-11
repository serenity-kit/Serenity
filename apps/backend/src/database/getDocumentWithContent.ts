import { GetDocumentParams } from "@serenity-tools/secsync";
import { Prisma } from "../../prisma/generated/output";
import { serializeSnapshot, serializeUpdates } from "../utils/serialize";
import { prisma } from "./prisma";

export async function getDocumentWithContent({
  documentId,
  knownSnapshotId,
  knownSnapshotUpdateClocks,
  mode,
}: GetDocumentParams) {
  return prisma.$transaction(
    async (prisma) => {
      const doc = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
        include: { activeSnapshot: { select: { id: true } } },
      });
      if (!doc.activeSnapshot) {
        throw new Error("Active Snapshot not found");
      }

      // let parentFolder: Folder | null = null;
      // if (doc.parentFolderId) {
      //   parentFolder = await prisma.folder.findUnique({
      //     where: { id: doc.parentFolderId },
      //   });
      // }

      let snapshotProofChain: {
        id: string;
        parentSnapshotProof: string;
        ciphertextHash: string;
      }[] = [];

      if (knownSnapshotId && knownSnapshotId !== doc.activeSnapshot.id) {
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

      let lastKnownVersion: number | undefined = undefined;
      // in case the last known snapshot is the current one, try to find the lastKnownVersion number
      if (
        knownSnapshotId === doc.activeSnapshot.id &&
        knownSnapshotUpdateClocks
      ) {
        const updateIds = Object.entries(knownSnapshotUpdateClocks).map(
          ([pubKey, clock]) => {
            return `${knownSnapshotId}-${pubKey}-${clock}`;
          }
        );
        const lastUpdate = await prisma.update.findFirst({
          where: {
            id: { in: updateIds },
          },
          orderBy: { version: "desc" },
        });
        if (lastUpdate) {
          lastKnownVersion = lastUpdate.version;
        }
      }

      // fetch the active snapshot with
      // - all updates after the last known version if there is one and
      // - all updates if there is none
      const activeSnapshot = await prisma.snapshot.findUniqueOrThrow({
        where: { id: doc.activeSnapshot.id },
        include: {
          updates:
            lastKnownVersion !== undefined
              ? {
                  orderBy: { version: "asc" },
                  where: {
                    version: { gt: lastKnownVersion },
                  },
                }
              : {
                  orderBy: { version: "asc" },
                },
        },
      });

      if (mode === "delta" && knownSnapshotId === activeSnapshot.id) {
        return {
          updates: serializeUpdates(activeSnapshot.updates),
        };
      }

      return {
        // doc: {
        //   id: doc.id,
        //   parentFolderId: doc.parentFolderId,
        //   workspaceKeyId: doc.workspaceKeyId,
        //   workspaceId: doc.workspaceId,
        // },
        // parentFolder: {
        //   id: parentFolder?.id,
        //   parentFolderId: parentFolder?.parentFolderId,
        //   subkeyId: parentFolder?.subkeyId, // TODO: remove
        //   keyDerivationTrace: parentFolder?.keyDerivationTrace,
        // },
        snapshot: serializeSnapshot(activeSnapshot),
        updates: serializeUpdates(activeSnapshot.updates),
        snapshotProofChain: snapshotProofChain.map(
          (snapshotProofChainEntry) => {
            return {
              snapshotId: snapshotProofChainEntry.id,
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
