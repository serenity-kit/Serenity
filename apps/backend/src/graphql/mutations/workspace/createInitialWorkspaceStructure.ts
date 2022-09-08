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
    t.nonNull.string("creatorDeviceSigningPublicKey");
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

export const DocumentSnapshotInput = inputObjectType({
  name: "DocumentSnapshotInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("signature");
    t.nonNull.field("publicData", { type: DocumentSnapshotPublicDataInput });
  },
});

export const CreateInitialWorkspaceStructureInput = inputObjectType({
  name: "CreateInitialWorkspaceStructureInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("workspaceName");
    t.nonNull.string("folderId");
    t.nonNull.string("folderIdSignature");
    t.nonNull.string("encryptedFolderName");
    t.nonNull.string("encryptedFolderNameNonce");
    t.nonNull.int("folderSubkeyId");
    t.nonNull.string("documentId");
    t.nonNull.string("encryptedDocumentName");
    t.nonNull.string("encryptedDocumentNameNonce");
    t.nonNull.int("documentSubkeyId");
    t.nonNull.field("documentSnapshot", { type: DocumentSnapshotInput });
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: DeviceWorkspaceKeyBoxInput,
    });
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
      args.input.deviceWorkspaceKeyBoxes.forEach((deviceWorkspaceKeyBox) => {
        context.assertValidDeviceSigningPublicKeyForThisSession(
          deviceWorkspaceKeyBox.creatorDeviceSigningPublicKey
        );
        context.assertValidDeviceSigningPublicKeyForThisSession(
          deviceWorkspaceKeyBox.deviceSigningPublicKey
        );
      });
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        workspaceName: args.input.workspaceName,
        folderId: args.input.folderId,
        folderIdSignature: args.input.folderIdSignature,
        encryptedFolderName: args.input.encryptedFolderName,
        encryptedFolderNameNonce: args.input.encryptedFolderNameNonce,
        folderSubkeyId: args.input.folderSubkeyId,
        documentId: args.input.documentId,
        encryptedDocumentName: args.input.encryptedDocumentName,
        encryptedDocumentNameNonce: args.input.encryptedDocumentNameNonce,
        documentSubkeyId: args.input.documentSubkeyId,
        documentSnapshot: args.input.documentSnapshot,
        deviceWorkspaceKeyBoxes: args.input.deviceWorkspaceKeyBoxes,
      });
      return workspaceStructure;
    },
  }
);
