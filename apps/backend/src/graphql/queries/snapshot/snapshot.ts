import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField, stringArg } from "nexus";
import { getSnapshot } from "../../../database/snapshot/getSnapshot";
import { formatSnapshot } from "../../../types/snapshot";
import { Snapshot } from "../../types/snapshot";

export const snapshotQuery = queryField((t) => {
  t.field("snapshot", {
    type: Snapshot,
    args: {
      documentId: nonNull(idArg()),
      documentShareLinkToken: stringArg(),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.documentId) {
        throw new UserInputError("Invalid input: id cannot be null");
      }
      const snapshot = await getSnapshot({
        userId: context.user.id,
        documentId: args.documentId,
        documentShareLinkToken: args.documentShareLinkToken,
      });
      if (snapshot) {
        return formatSnapshot(snapshot);
      } else {
        return null;
      }
    },
  });
});
