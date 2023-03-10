import { Snapshot } from "@naisho/core";
import { AuthenticationError, UserInputError } from "apollo-server-express";
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
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.int("subkeyId");
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
    if (!args.input.snapshot.publicData.snapshotId) {
      throw new UserInputError("Invalid input: snapshotId cannot be null");
    }
    const snapshot = args.input.snapshot as Snapshot;
    const document = await createDocument({
      userId: context.user.id,
      id: args.input.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      workspaceKeyId: null,
      subkeyId: args.input.subkeyId,
      parentFolderId: args.input.parentFolderId,
      workspaceId: args.input.workspaceId,
      snapshot,
    });
    return {
      id: document.id,
    };
  },
});
