import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDocument } from "../../database/createDocument";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
  },
});

export const CreateDocumentResult = objectType({
  name: "CreateDocumentResult",
  definition(t) {
    t.nonNull.string("id");
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
    if (!args?.input?.id) throw new Error("Missing documentId");
    const document = await createDocument({
      id: args.input.id,
      workspaceId: args.input.workspaceId,
    });
    return {
      id: document.id,
    };
  },
});
