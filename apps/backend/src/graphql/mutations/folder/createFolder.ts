import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createFolder } from "../../../database/folder/createFolder";
import { Folder } from "../../types/folder";

export const CreateFolderInput = inputObjectType({
  name: "CreateFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.string("parentFolderId");
    t.nonNull.string("workspaceId");
  },
});

export const CreateFolderResult = objectType({
  name: "CreateFolderResult",
  definition(t) {
    t.field("folder", { type: Folder });
  },
});

export const createFolderMutation = mutationField("createFolder", {
  type: CreateFolderResult,
  args: {
    input: arg({
      type: CreateFolderInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    let parentFolderId: string | undefined = undefined;
    if (args.input.parentFolderId) {
      parentFolderId = args.input.parentFolderId;
    }
    let name: string | undefined = undefined;
    if (args.input.name) {
      name = args.input.name;
    }
    const folder = await createFolder({
      username: context.user.username,
      id: args.input.id,
      name,
      parentFolderId,
      workspaceId: args.input.workspaceId,
    });
    return { folder };
  },
});
