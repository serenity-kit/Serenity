import { KeyDerivationTrace } from "@serenity-tools/common";
import {
  CreateUpdateParams,
  SecsyncNewSnapshotRequiredError,
} from "@serenity-tools/secsync";
import { Prisma } from "../../prisma/generated/output";
import { serializeUpdate } from "../utils/serialize";
import { prisma } from "./prisma";

export async function createUpdate({ update }: CreateUpdateParams) {
  return await prisma.$transaction(
    async (prisma) => {
      const snapshot = await prisma.snapshot.findUniqueOrThrow({
        where: { id: update.publicData.refSnapshotId },
        select: {
          latestVersion: true,
          clocks: true,
          document: {
            select: {
              activeSnapshotId: true,
              requiresSnapshot: true,
              workspaceId: true,
            },
          },
          keyDerivationTrace: true,
        },
      });
      const currentWorkspaceKey = await prisma.workspaceKey.findFirstOrThrow({
        where: { workspaceId: snapshot.document.workspaceId },
        select: { id: true },
        orderBy: { generation: "desc" },
      });

      if (
        snapshot.document.activeSnapshotId !== update.publicData.refSnapshotId
      ) {
        throw new Error("Update referencing an out of date snapshot.");
      }

      const snapshotKeyDerivationTrace =
        snapshot.keyDerivationTrace as KeyDerivationTrace;
      if (
        // page share link has been removed
        snapshot.document.requiresSnapshot ||
        // workspaceKey has been rotated
        snapshotKeyDerivationTrace.workspaceKeyId !== currentWorkspaceKey.id
      ) {
        throw new SecsyncNewSnapshotRequiredError("Key roration is required");
      }

      if (
        snapshot.clocks &&
        typeof snapshot.clocks === "object" &&
        !Array.isArray(snapshot.clocks)
      ) {
        if (snapshot.clocks[update.publicData.pubKey] === undefined) {
          if (update.publicData.clock !== 0) {
            throw new Error(
              `Update clock incorrect. Clock: ${update.publicData.clock}, but should be 0`
            );
          }
          // update the clock for the public key
          snapshot.clocks[update.publicData.pubKey] = update.publicData.clock;
        } else {
          const expectedClockValue =
            // @ts-expect-error
            snapshot.clocks[update.publicData.pubKey] + 1;
          if (expectedClockValue !== update.publicData.clock) {
            throw new Error(
              `Update clock incorrect. Clock: ${update.publicData.clock}, but should be ${expectedClockValue}`
            );
          }
          // update the clock for the public key
          snapshot.clocks[update.publicData.pubKey] = update.publicData.clock;
        }
      }

      await prisma.snapshot.update({
        where: { id: update.publicData.refSnapshotId },
        data: {
          latestVersion: snapshot.latestVersion + 1,
          clocks: snapshot.clocks as Prisma.JsonObject,
        },
      });

      return serializeUpdate(
        await prisma.update.create({
          data: {
            id: `${update.publicData.refSnapshotId}-${update.publicData.pubKey}-${update.publicData.clock}`,
            data: JSON.stringify(update),
            version: snapshot.latestVersion + 1,
            snapshot: {
              connect: {
                id: update.publicData.refSnapshotId,
              },
            },
            clock: update.publicData.clock,
            pubKey: update.publicData.pubKey,
          },
        })
      );
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
