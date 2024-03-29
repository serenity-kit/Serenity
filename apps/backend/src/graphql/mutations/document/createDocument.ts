import * as documentChain from "@serenity-kit/document-chain";
import {
  SerenitySnapshotWithClientData,
  verifyDocumentNameSignature,
} from "@serenity-tools/common";
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
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("nameSignature");
    t.nonNull.string("nameWorkspaceMemberDevicesProofHash");
    t.nonNull.string("subkeyId");
    t.nonNull.string("parentFolderId");
    t.nonNull.string("workspaceId");
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
    t.nonNull.string("serializedDocumentChainEvent");
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

    const isValid = verifyDocumentNameSignature({
      authorSigningPublicKey: context.session.deviceSigningPublicKey,
      ciphertext: args.input.nameCiphertext,
      nonce: args.input.nameNonce,
      signature: args.input.nameSignature,
    });
    if (!isValid) {
      throw new Error("Invalid document name signature on document create");
    }

    const documentChainEvent = documentChain.CreateDocumentChainEvent.parse(
      JSON.parse(args.input.serializedDocumentChainEvent)
    );

    const snapshot = args.input.snapshot as SerenitySnapshotWithClientData;
    const { document } = await createDocument({
      userId: context.user.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      nameSignature: args.input.nameSignature,
      nameWorkspaceMemberDevicesProofHash:
        args.input.nameWorkspaceMemberDevicesProofHash,
      nameCreatorDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      workspaceKeyId: null,
      subkeyId: args.input.subkeyId,
      parentFolderId: args.input.parentFolderId,
      workspaceId: args.input.workspaceId,
      snapshot,
      documentChainEvent,
    });
    return {
      id: document.id,
    };
  },
});
