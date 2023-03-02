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
import { KeyDerivationTraceInput2 } from "../../types/keyDerivation";
import { Snapshot } from "../../types/snapshot";
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
    t.nonNull.string("id");
    t.nonNull.string("name");
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
    t.nonNull.string("idSignature");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.field("keyDerivationTrace", {
      type: KeyDerivationTraceInput2,
    });
  },
});

export const CreateInitialDocumentInput = inputObjectType({
  name: "CreateInitialDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.int("subkeyId");
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
  },
});

export const CreateInitialWorkspaceStructureInput = inputObjectType({
  name: "CreateInitialWorkspaceStructureInput",
  definition(t) {
    t.nonNull.field("workspace", { type: CreateInitialWorkspaceInput });
    t.nonNull.field("folder", { type: CreateInitialFolderInput });
    t.nonNull.field("document", { type: CreateInitialDocumentInput });
    t.nonNull.string("creatorDeviceSigningPublicKey");
  },
});

export const CreateInitialWorkspaceStructureResult = objectType({
  name: "CreateInitialWorkspaceStructureResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
    t.field("folder", { type: Folder });
    t.field("document", { type: Document });
    t.field("snapshot", { type: Snapshot });
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
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspace: args.input.workspace,
        folder: args.input.folder,
        // @ts-ignore we need to force the snapshot.publicData to have a snapshot Id
        document: args.input.document,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
      });
      return workspaceStructure;
    },
  }
);
