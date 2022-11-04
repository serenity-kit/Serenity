import { AuthenticationError } from "apollo-server-express";
import { idArg, nonNull, objectType, queryField } from "nexus";
import { getLatestSnapshot } from "../../../database/snapshot/getLatestSnapshot";
import { Snapshot } from "../../types/snapshot";

export const SnapshotResult = objectType({
  name: "SnapshotResult",
  definition(t) {
    t.field("snapshot", { type: Snapshot });
  },
});

export const latestSnapshotQuery = queryField((t) => {
  t.field("latestSnapshot", {
    type: SnapshotResult,
    args: {
      documentId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const snapshot = await getLatestSnapshot({
        userId: context.user.id,
        documentId: args.documentId,
      });
      return { snapshot };
    },
  });
});
