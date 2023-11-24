import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateDocumentName } from "../../../database/document/updateDocumentName";
import { Document } from "../../types/document";

export const UpdateDocumentNameInput = inputObjectType({
  name: "UpdateDocumentNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("subkeyId");
  },
});

export const UpdateDocumentNameResult = objectType({
  name: "UpdateDocumentNameResult",
  definition(t) {
    t.field("document", { type: Document });
  },
});

export const updateDocumentNameMutation = mutationField("updateDocumentName", {
  type: UpdateDocumentNameResult,
  args: {
    input: nonNull(
      arg({
        type: UpdateDocumentNameInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const document = await updateDocumentName({
      id: args.input.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId,
      userId: context.user.id,
    });
    return { document };
  },
});
