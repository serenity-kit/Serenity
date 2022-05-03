import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDocument } from "../../database/createDocument";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("documentId");
    t.nonNull.string("name");
    t.nonNull.string("workspaceId");
  },
});

export const CreateDocumentResult = objectType({
  name: "CreateDocumentResult",
  definition(t) {
    t.nonNull.string("documentId");
  },
});

export const createDocumentMutation = mutationField("createDocument", {
  type: CreateDocumentResult,
  args: {
    input: arg({
      type: CreateDocumentInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args?.input?.documentId) throw new Error("Missing documentId");
    await createDocument({
      documentId: args.input.documentId,
      name: args.input.name,
      workspaceId: args.input.workspaceId,
    });
    return {
      documentId: args.input.documentId,
    };
  },
});
