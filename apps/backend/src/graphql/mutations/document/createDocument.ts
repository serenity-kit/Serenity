import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createDocument } from "../../../database/document/createDocument";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const CreateDocumentInput = inputObjectType({
  name: "CreateDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("parentFolderId");
    t.nonNull.string("workspaceId");
    t.nonNull.int("contentSubkeyId");
    t.field("nameKeyDerivationTrace", {
      type: KeyDerivationTraceInput,
    });
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
    const parentFolderId = args.input.parentFolderId || null;
    const document = await createDocument({
      userId: context.user.id,
      id: args.input.id,
      encryptedName: null,
      encryptedNameNonce: null,
      workspaceKeyId: null,
      subkeyId: null,
      parentFolderId,
      workspaceId: args.input.workspaceId,
      nameKeyDerivationTrace: args.input.nameKeyDerivationTrace,
      contentSubkeyId: args.input.contentSubkeyId,
    });
    return {
      id: document.id,
    };
  },
});
