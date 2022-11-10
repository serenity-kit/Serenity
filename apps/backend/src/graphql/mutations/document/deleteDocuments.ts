import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteDocuments } from "../../../database/document/deleteDocuments";

export const DeleteDocumentsInput = inputObjectType({
  name: "DeleteDocumentsInput",
  definition(t) {
    t.nonNull.list.nonNull.field("ids", {
      type: "String",
    });
    t.nonNull.string("workspaceId");
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
    input: nonNull(
      arg({
        type: DeleteDocumentsInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await deleteDocuments({
      documentIds: args.input.ids,
      workspaceId: args.input.workspaceId,
      userId: context.user.id,
    });
    return { status: "success" };
  },
});
