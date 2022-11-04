import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createInitialWorkspaceStructure } from "../../../database/workspace/createInitialWorkspaceStructure";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";
import { Workspace } from "../../types/workspace";

export const DeviceWorkspaceKeyBoxInput = inputObjectType({
  name: "DeviceWorkspaceKeyBoxInput",
  definition(t) {
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const DocumentSnapshotPublicDataInput = inputObjectType({
  name: "DocumentSnapshotPublicDataInput",
  definition(t) {
    t.nonNull.string("docId");
    t.nonNull.string("pubKey");
    t.nonNull.string("snapshotId");
  },
});

export const InitialWorkspaceWorkspaceInput = inputObjectType({
  name: "InitialWorkspaceWorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: DeviceWorkspaceKeyBoxInput,
    });
  },
});

export const InitialWorkspaceFolderInput = inputObjectType({
  name: "InitialWorkspaceFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("idSignature");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.int("subkeyId");
  },
});

export const InitialWorkspaceDocumentInput = inputObjectType({
  name: "InitialWorkspaceDocumentInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.int("subkeyId");
    t.nonNull.field("snapshot", { type: DocumentSnapshotInput });
  },
});

export const DocumentSnapshotInput = inputObjectType({
  name: "DocumentSnapshotInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signature");
    t.nonNull.int("subkeyId");
    t.nonNull.field("publicData", { type: DocumentSnapshotPublicDataInput });
  },
});

export const CreateInitialWorkspaceStructureInput = inputObjectType({
  name: "CreateInitialWorkspaceStructureInput",
  definition(t) {
    t.nonNull.field("workspace", { type: InitialWorkspaceWorkspaceInput });
    t.nonNull.field("folder", { type: InitialWorkspaceFolderInput });
    t.nonNull.field("document", { type: InitialWorkspaceDocumentInput });
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
        args.input.workspace.creatorDeviceSigningPublicKey
      );
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspace: args.input.workspace,
        folder: args.input.folder,
        document: args.input.document,
      });
      return workspaceStructure;
    },
  }
);
