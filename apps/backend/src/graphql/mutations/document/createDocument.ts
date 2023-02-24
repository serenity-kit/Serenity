import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createDocument } from "../../../database/document/createDocument";
import { DocumentSnapshotInput } from "../../types/document";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("parentFolderId");
    t.nonNull.string("workspaceId");
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
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
    input: nonNull(
      arg({
        type: CreateDocumentInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const document = await createDocument({
      userId: context.user.id,
      id: args.input.id,
      encryptedName: null,
      encryptedNameNonce: null,
      workspaceKeyId: null,
      subkeyId: null,
      parentFolderId: args.input.parentFolderId,
      workspaceId: args.input.workspaceId,
      snapshot: args.input.snapshot,
    });
    return {
      id: document.id,
    };
  },
});
