import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
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
    t.nonNull.string("folderName");
    t.nonNull.string("encryptedFolderName");
    t.nonNull.string("encryptedFolderNameNonce");
    t.nonNull.int("folderSubkeyId");
    t.nonNull.string("documentId");
    t.nonNull.string("documentName");
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
      input: arg({
        type: CreateInitialWorkspaceStructureInput,
      }),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.input) {
        throw new UserInputError("Invalid input");
      }
      if (!args.input.workspaceId) {
        throw new UserInputError("Invalid input: workspaceId cannot be null");
      }
      if (!args.input.workspaceName) {
        throw new UserInputError("Invalid input: workspaceName cannot be null");
      }
      if (!args.input.folderId) {
        throw new UserInputError("Invalid input: folderId cannot be null");
      }
      if (!args.input.folderIdSignature) {
        throw new UserInputError(
          "Invalid input: folderIdSignature cannot be null"
        );
      }
      if (!args.input.folderName) {
        throw new UserInputError("Invalid input: folderName cannot be null");
      }
      if (!args.input.encryptedFolderName) {
        throw new UserInputError(
          "Invalid input: encryptedFolderName cannot be null"
        );
      }
      if (!args.input.encryptedFolderNameNonce) {
        throw new UserInputError(
          "Invalid input: encryptedFolderNameNonce cannot be null"
        );
      }
      if (!args.input.folderSubkeyId) {
        throw new UserInputError(
          "Invalid input: folderSubkeyId cannot be null"
        );
      }
      if (typeof args.input.folderSubkeyId !== "number") {
        throw new UserInputError(
          "Invalid input: folderSubkeyId must be a number"
        );
      }
      if (!args.input.documentId) {
        throw new UserInputError("Invalid input: documentId cannot be null");
      }
      if (!args.input.documentName) {
        throw new UserInputError("Invalid input: documentName cannot be null");
      }
      if (!args.input.documentSnapshot) {
        throw new UserInputError(
          "Invalid input: documentSnapshot cannot be null"
        );
      }
      if (!args.input.deviceWorkspaceKeyBoxes) {
        throw new UserInputError(
          "Invalid input: deviceWorkspaceKeyBoxes cannot be netull"
        );
      }
      if (args.input.deviceWorkspaceKeyBoxes.length <= 0) {
        throw new UserInputError(
          "Invalid input: deviceWorkspaceKeyBoxes cannot be empty"
        );
      }
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        workspaceName: args.input.workspaceName,
        folderId: args.input.folderId,
        folderIdSignature: args.input.folderIdSignature,
        folderName: args.input.folderName,
        encryptedFolderName: args.input.encryptedFolderName,
        encryptedFolderNameNonce: args.input.encryptedFolderNameNonce,
        folderSubkeyId: args.input.folderSubkeyId,
        documentId: args.input.documentId,
        documentName: args.input.documentName,
        documentSnapshot: args.input.documentSnapshot,
        deviceWorkspaceKeyBoxes: args.input.deviceWorkspaceKeyBoxes,
      });
      return workspaceStructure;
    },
  }
);
