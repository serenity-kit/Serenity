import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createInitialWorkspaceStructure } from "../../../database/workspace/createInitialWorkspaceStructure";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";
import { Workspace } from "../../types/workspace";

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
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceAeadCiphertext");
    t.nonNull.string("folderId");
    t.nonNull.string("folderIdSignature");
    t.nonNull.string("folderName");
    t.nonNull.string("documentId");
    t.nonNull.string("documentName");
    t.nonNull.field("documentSnapshot", { type: DocumentSnapshotInput });
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
        throw new Error("Invalid input");
      }
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        workspaceName: args.input.workspaceName,
        deviceSigningPublicKey: args.input.deviceSigningPublicKey,
        deviceAeadCiphertext: args.input.deviceAeadCiphertext,
        folderId: args.input.folderId,
        folderIdSignature: args.input.folderIdSignature,
        folderName: args.input.folderName,
        documentId: args.input.documentId,
        documentName: args.input.documentName,
        documentSnapshot: args.input.documentSnapshot,
      });
      return workspaceStructure;
    },
  }
);
