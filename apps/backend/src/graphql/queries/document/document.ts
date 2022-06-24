import { idArg, nonNull, queryField, objectType } from "nexus";
import { getDocument } from "../../../database/document/getDocument";
import { Document } from "../../types/document";

export const DocumentResult = objectType({
  name: "DocumentResult",
  definition(t) {
    t.field("document", { type: Document });
  },
});

export const documentQuery = queryField((t) => {
  t.field("document", {
    type: DocumentResult,
    args: {
      id: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const userId = context.user.id;
      const document = await getDocument({
        userId,
        id: args.id,
      });
      return { document };
    },
  });
});
