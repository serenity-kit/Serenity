import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDocument } from "../../database/createDocument";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("documentId");
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
    await createDocument(args.input.documentId);
    return {
      documentId: args.input.documentId,
    };
  },
});
