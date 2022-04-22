import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDocument } from "../../database/createDocument";

const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("documentId");
  },
});

const CreateDocumentResult = objectType({
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
    await createDocument(args.input.documentId);
    return {
      documentId: args.input.documentId,
    };
  },
});
