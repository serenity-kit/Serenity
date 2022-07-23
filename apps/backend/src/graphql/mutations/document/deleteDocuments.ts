import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { deleteDocuments } from "../../../database/document/deleteDocuments";

export const DeleteDocumentsInput = inputObjectType({
  name: "DeleteDocumentsInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
  },
});

export const DeleteDocumentsResult = objectType({
  name: "DeleteDocumentsResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteDocumentsMutation = mutationField("deleteDocuments", {
  type: DeleteDocumentsResult,
  args: {
    input: arg({
      type: DeleteDocumentsInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    await deleteDocuments({
      documentIds: args.input.ids,
      userId: context.user.id,
    });
    return { status: "success" };
  },
});
