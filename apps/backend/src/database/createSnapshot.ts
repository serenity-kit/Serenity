import {
  KeyDerivationTrace,
  NaishoNewSnapshotWithKeyRotationRequired,
  NaishoSnapshotBasedOnOutdatedSnapshotError,
  NaishoSnapshotMissesUpdatesError,
  Snapshot,
} from "@naisho/core";
import { prisma } from "./prisma";

type ActiveSnapshotInfo = {
  latestVersion: number;
  snapshotId: string;
};

type CreateSnapshotParams = {
  snapshot: Snapshot;
  workspaceId: string;
  activeSnapshotInfo?: ActiveSnapshotInfo;
};

export async function createSnapshot({
  snapshot,
  activeSnapshotInfo,
  workspaceId,
}: CreateSnapshotParams) {
  return await prisma.$transaction(async (prisma) => {
    const documentPromise = prisma.document.findUniqueOrThrow({
      where: { id: snapshot.publicData.docId },
      select: {
        activeSnapshot: true,
        requiresSnapshot: true,
      },
    });
    const currentWorkspaceKeyPromise = prisma.workspaceKey.findFirstOrThrow({
      where: { workspaceId },
      select: { id: true },
      orderBy: { generation: "desc" },
    });
    const [document, currentWorkspaceKey] = await Promise.all([
      documentPromise,
      currentWorkspaceKeyPromise,
    ]);

    const snapshotKeyDerivationTrace = snapshot.publicData
      .keyDerivationTrace as KeyDerivationTrace;

    if (
      // workspaceKey has been rotated
      snapshotKeyDerivationTrace.workspaceKeyId !== currentWorkspaceKey.id
    ) {
      throw new NaishoNewSnapshotWithKeyRotationRequired(
        "Key roration is required"
      );
    }

    // function sleep(ms) {
    //   return new Promise((resolve) => setTimeout(resolve, ms));
    // }
    // await sleep(3000);

    // const random = Math.floor(Math.random() * 10);
    // if (random < 8) {
    //   throw new NaishoSnapshotBasedOnOutdatedSnapshotError(
    //     "Snapshot is out of date."
    //   );
    // }

    // const random = Math.floor(Math.random() * 10);
    // if (random < 8) {
    //   throw new NaishoSnapshotMissesUpdatesError(
    //     "Snapshot does not include the latest changes."
    //   );
    // }

    if (
      document.activeSnapshot &&
      activeSnapshotInfo !== undefined &&
      document.activeSnapshot.id !== activeSnapshotInfo.snapshotId
    ) {
      throw new NaishoSnapshotBasedOnOutdatedSnapshotError(
        "Snapshot is out of date."
      );
    }

    if (
      document.activeSnapshot &&
      activeSnapshotInfo !== undefined &&
      document.activeSnapshot.latestVersion !== activeSnapshotInfo.latestVersion
    ) {
      throw new NaishoSnapshotMissesUpdatesError(
        "Snapshot does not include the latest changes."
      );
    }

    // only update when necessary
    if (document.requiresSnapshot) {
      await prisma.document.update({
        where: { id: snapshot.publicData.docId },
        data: { requiresSnapshot: false },
      });
    }

    return await prisma.snapshot.create({
      data: {
        id: snapshot.publicData.snapshotId,
        latestVersion: 0,
        preview: "",
        data: JSON.stringify(snapshot),
        activeSnapshotDocument: {
          connect: { id: snapshot.publicData.docId },
        },
        document: { connect: { id: snapshot.publicData.docId } },
        keyDerivationTrace: snapshot.publicData.keyDerivationTrace,
        subkeyId: snapshot.publicData.subkeyId,
        clocks: {},
      },
    });
  });
}
