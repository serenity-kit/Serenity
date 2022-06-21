import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createInitialWorkspaceStructure } from "../../../database/workspace/createInitialWorkspaceStructure";
import { Document } from "../../types/document";
import { Folder } from "../../types/folder";
import { Workspace } from "../../types/workspace";

export const CreateInitialWorkspaceStructureInput = inputObjectType({
  name: "CreateInitialWorkspaceStructureInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("workspaceName");
    t.nonNull.string("folderId");
    t.nonNull.string("folderIdSignature");
    t.nonNull.string("folderName");
    t.nonNull.string("documentId");
    t.nonNull.string("documentName");
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
        throw new Error("Unauthorized");
      }
      if (!args.input) {
        throw new Error("Invalid input");
      }
      const workspaceStructure = await createInitialWorkspaceStructure({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        workspaceName: args.input.workspaceName,
        folderId: args.input.folderId,
        folderIdSignature: args.input.folderIdSignature,
        folderName: args.input.folderName,
        documentId: args.input.documentId,
        documentName: args.input.documentName,
      });
      return workspaceStructure;
    },
  }
);
