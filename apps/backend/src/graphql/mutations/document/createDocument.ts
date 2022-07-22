import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDocument } from "../../../database/document/createDocument";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("parentFolderId");
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
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args?.input?.id) throw new Error("Missing documentId");
    const parentFolderId = args.input.parentFolderId || null;
    // FIXME: does this need a userId?
    const document = await createDocument({
      id: args.input.id,
      name: null,
      parentFolderId,
      workspaceId: args.input.workspaceId,
    });
    return {
      id: document.id,
    };
  },
});
