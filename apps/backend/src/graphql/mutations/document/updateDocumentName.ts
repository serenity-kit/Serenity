import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateDocumentName } from "../../../database/document/updateDocumentName";
import { formatDocument } from "../../../types/document";
import { Document } from "../../types/document";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const UpdateDocumentNameInput = inputObjectType({
  name: "UpdateDocumentNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.int("subkeyId");
    t.nonNull.field("nameKeyDerivationTrace", {
      type: KeyDerivationTraceInput,
    });
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
      encryptedName: args.input.encryptedName,
      encryptedNameNonce: args.input.encryptedNameNonce,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId, // TODO: remove
      userId: context.user.id,
      nameKeyDerivationTrace: args.input.nameKeyDerivationTrace,
    });
    return { document: formatDocument(document) };
  },
});
