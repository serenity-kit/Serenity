import {
  DocumentShareLinkDeviceBox,
  KeyDerivationTrace,
  SerenitySnapshotWithClientData,
  equalUnorderedStringArrays,
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
  subkeyId: string;
};

type Params = {
  snapshot: SerenitySnapshotWithClientData;
  prismaTransactionClient?: Prisma.TransactionClient;
};

export async function createSnapshot({
  snapshot,
  prismaTransactionClient,
}: Params) {
  const execute = async (prisma: Prisma.TransactionClient) => {
    const documentTitleData: CreateSnapshotDocumentTitleData | undefined =
      snapshot.additionalServerData?.documentTitleData;

    const documentShareLinkDeviceBoxes: DocumentShareLinkDeviceBox[] =
      snapshot.additionalServerData?.documentShareLinkDeviceBoxes || [];

    const document = await prisma.document.findUniqueOrThrow({
      where: { id: snapshot.publicData.docId },
      select: {
        activeSnapshot: true,
        requiresSnapshot: true,
        workspaceId: true,
        documentShareLinks: true,
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

    if (
      !equalUnorderedStringArrays(
        document.documentShareLinks
          .map((entry) => entry.deviceSigningPublicKey)
          .sort(),
        documentShareLinkDeviceBoxes
          .map((entry) => entry.deviceSigningPublicKey)
          .sort()
      )
    ) {
      console.log("documentShareLinkDeviceBoxes", documentShareLinkDeviceBoxes);
      console.log(
        "documentShareLinks",
        document.documentShareLinks.map((entry) => entry.deviceSigningPublicKey)
      );
      throw new Error("Missing or too many documentShareLinkDeviceBoxes");
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
        snapshotKeyBoxes: {
          createMany: {
            data: documentShareLinkDeviceBoxes.map((deviceBox) => {
              return {
                ciphertext: deviceBox.ciphertext,
                creatorDeviceSigningPublicKey: snapshot.publicData.pubKey,
                nonce: deviceBox.nonce,
                documentShareLinkDeviceSigningPublicKey:
                  deviceBox.deviceSigningPublicKey,
              };
            }),
          },
        },
      },
    });

    return serializeSnapshot(newSnapshot);
  };

  if (prismaTransactionClient) {
    return await execute(prismaTransactionClient);
  }

  return await prisma.$transaction(execute, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}
