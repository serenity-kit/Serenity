import * as documentChain from "@serenity-kit/document-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createInitialWorkspaceStructure } from "../../../database/workspace/createInitialWorkspaceStructure";
import { Document, DocumentSnapshotInput } from "../../types/document";
import { Folder } from "../../types/folder";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";
import { Workspace } from "../../types/workspace";

export const DeviceWorkspaceKeyBoxInput = inputObjectType({
  name: "DeviceWorkspaceKeyBoxInput",
  definition(t) {
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const CreateInitialWorkspaceInput = inputObjectType({
  name: "CreateInitialWorkspaceInput",
  definition(t) {
    t.nonNull.string("infoCiphertext");
    t.nonNull.string("infoNonce");
    t.nonNull.string("infoSignature");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: DeviceWorkspaceKeyBoxInput,
    });
  },
});

export const CreateInitialFolderInput = inputObjectType({
  name: "CreateInitialFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("signature");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.field("keyDerivationTrace", {
      type: KeyDerivationTraceInput,
    });
  },
});

export const CreateInitialDocumentInput = inputObjectType({
  name: "CreateInitialDocumentInput",
  definition(t) {
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("nameSignature");
    t.nonNull.string("subkeyId");
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
    t.nonNull.string("serializedDocumentChainEvent");
  },
});

export const CreateInitialWorkspaceStructureInput = inputObjectType({
  name: "CreateInitialWorkspaceStructureInput",
  definition(t) {
    t.nonNull.field("workspace", { type: CreateInitialWorkspaceInput });
    t.nonNull.string("serializedWorkspaceChainEvent");
    t.nonNull.field("folder", { type: CreateInitialFolderInput });
    t.nonNull.field("document", { type: CreateInitialDocumentInput });
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("serializedWorkspaceMemberDevicesProof");
  },
});

export const CreateInitialWorkspaceStructureResult = objectType({
  name: "CreateInitialWorkspaceStructureResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
    t.field("folder", { type: Folder });
    t.field("document", { type: Document });
  },
});

export const createInitialWorkspaceStructureMutation = mutationField(
  "createInitialWorkspaceStructure",
  {
    type: CreateInitialWorkspaceStructureResult,
    args: {
      input: nonNull(
        arg({
          type: CreateInitialWorkspaceStructureInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      context.assertValidDeviceSigningPublicKeyForThisSession(
        args.input.creatorDeviceSigningPublicKey
      );

      const workspaceChainEvent =
        workspaceChain.CreateChainWorkspaceChainEvent.parse(
          JSON.parse(args.input.serializedWorkspaceChainEvent)
        );

      workspaceChain.assertAuthorOfEvent(
        workspaceChainEvent,
        context.user.mainDeviceSigningPublicKey
      );

      const workspaceMemberDevicesProof =
        workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
          JSON.parse(args.input.serializedWorkspaceMemberDevicesProof)
        );

      const documentChainEvent = documentChain.CreateDocumentChainEvent.parse(
        JSON.parse(args.input.document.serializedDocumentChainEvent)
      );

      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspace: {
          ...args.input.workspace,
          id: workspaceChainEvent.transaction.id,
        },
        workspaceChainEvent,
        folder: args.input.folder,
        document: args.input.document,
        userMainDeviceSigningPublicKey: context.user.mainDeviceSigningPublicKey,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        documentChainEvent,
        workspaceMemberDevicesProof,
      });
      return workspaceStructure;
    },
  }
);
