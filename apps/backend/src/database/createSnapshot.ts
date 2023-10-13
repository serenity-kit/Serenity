import {
  KeyDerivationTrace,
  SerenitySnapshotWithClientData,
  hash,
} from "@serenity-tools/common";
import {
  SecsyncNewSnapshotRequiredError,
  SecsyncSnapshotBasedOnOutdatedSnapshotError,
  SecsyncSnapshotMissesUpdatesError,
  compareUpdateClocks,
} from "@serenity-tools/secsync";
import { Prisma } from "../../prisma/generated/output";
import { serializeSnapshot } from "../utils/serialize";
import { prisma } from "./prisma";

export type CreateSnapshotDocumentTitleData = {
  ciphertext: string;
  nonce: string;
  workspaceKeyId: string;
  subkeyId: number;
};

type Params = {
  snapshot: SerenitySnapshotWithClientData;
};

export async function createSnapshot({ snapshot }: Params) {
  return await prisma.$transaction(
    async (prisma) => {
      const documentTitleData: CreateSnapshotDocumentTitleData | undefined =
        snapshot.additionalServerData?.documentTitleData;

      const document = await prisma.document.findUniqueOrThrow({
        where: { id: snapshot.publicData.docId },
        select: {
          activeSnapshot: true,
          requiresSnapshot: true,
          workspaceId: true,
        },
      });
      const currentWorkspaceKey = await prisma.workspaceKey.findFirstOrThrow({
        where: { workspaceId: document.workspaceId },
        select: { id: true },
        orderBy: { generation: "desc" },
      });

      const snapshotKeyDerivationTrace = snapshot.publicData
        .keyDerivationTrace as KeyDerivationTrace;

      if (
        // workspaceKey has been rotated
        snapshotKeyDerivationTrace.workspaceKeyId !== currentWorkspaceKey.id
      ) {
        throw new SecsyncNewSnapshotRequiredError("Key roration is required");
      }

      // function sleep(ms) {
      //   return new Promise((resolve) => setTimeout(resolve, ms));
      // }
      // await sleep(3000);

      // const random = Math.floor(Math.random() * 10);
      // if (random < 8) {
      //   throw new SecsyncSnapshotBasedOnOutdatedSnapshotError(
      //     "Snapshot is out of date."
      //   );
      // }

      // const random = Math.floor(Math.random() * 10);
      // if (random < 8) {
      //   throw new SecsyncSnapshotMissesUpdatesError(
      //     "Snapshot does not include the latest changes."
      //   );
      // }

      if (document.activeSnapshot) {
        if (
          snapshot.publicData.parentSnapshotId !== undefined &&
          snapshot.publicData.parentSnapshotId !== document.activeSnapshot.id
        ) {
          throw new SecsyncSnapshotBasedOnOutdatedSnapshotError(
            "Snapshot is out of date."
          );
        }

        const compareUpdateClocksResult = compareUpdateClocks(
          // @ts-expect-error the values are parsed by the function
          document.activeSnapshot.clocks,
          snapshot.publicData.parentSnapshotUpdateClocks
        );

        if (!compareUpdateClocksResult.equal) {
          throw new SecsyncSnapshotMissesUpdatesError(
            "Snapshot does not include the latest changes."
          );
        }
      }

      if (documentTitleData) {
        await prisma.document.update({
          where: { id: snapshot.publicData.docId },
          data: {
            nameCiphertext: documentTitleData.ciphertext,
            nameNonce: documentTitleData.nonce,
            workspaceKeyId: documentTitleData.workspaceKeyId,
            subkeyId: documentTitleData.subkeyId,
          },
        });
      }

      // only update when necessary
      if (document.requiresSnapshot) {
        await prisma.document.update({
          where: { id: snapshot.publicData.docId },
          data: { requiresSnapshot: false },
        });
      }

      const newSnapshot = await prisma.snapshot.create({
        data: {
          id: snapshot.publicData.snapshotId,
          latestVersion: 0,
          data: JSON.stringify(snapshot),
          ciphertextHash: hash(snapshot.ciphertext),
          activeSnapshotDocument: {
            connect: { id: snapshot.publicData.docId },
          },
          document: { connect: { id: snapshot.publicData.docId } },
          keyDerivationTrace: snapshot.publicData.keyDerivationTrace,
          clocks: {},
          parentSnapshotProof: snapshot.publicData.parentSnapshotProof,
          parentSnapshotUpdateClocks:
            snapshot.publicData.parentSnapshotUpdateClocks,
        },
      });
      return serializeSnapshot(newSnapshot);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
