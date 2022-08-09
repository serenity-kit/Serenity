import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createFolder } from "../../../database/folder/createFolder";
import { Folder } from "../../types/folder";

export const CreateFolderInput = inputObjectType({
  name: "CreateFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.string("encryptedName");
    t.string("nameNonce");
    t.int("subKeyId");
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
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new UserInputError("Invalid input");
    }
    if (!args.input.id) {
      throw new UserInputError("Invalid input: id cannot be null");
    }
    if (!args.input.workspaceId) {
      throw new UserInputError("Invalid input: workspaceId cannot be null");
    }
    let parentFolderId: string | undefined = undefined;
    if (args.input.parentFolderId) {
      parentFolderId = args.input.parentFolderId;
    }
    if (!args.input.encryptedName) {
      throw new UserInputError("Invalid input: encryptedName cannot be null");
    }
    if (!args.input.nameNonce) {
      throw new UserInputError("Invalid input: nameNonce cannot be null");
    }
    if (!args.input.subKeyId) {
      throw new UserInputError("Invalid input: subKeyId cannot be null");
    }
    if (typeof args.input.subKeyId !== "number") {
      throw new UserInputError("Invalid input: subKeyId must be a number");
    }
    let name: string | undefined = undefined;
    if (args.input.name) {
      name = args.input.name;
    }
    const folder = await createFolder({
      userId: context.user.id,
      id: args.input.id,
      name,
      encryptedName: args.input.encryptedName,
      nameNonce: args.input.nameNonce,
      subKeyId: args.input.subKeyId,
      parentFolderId,
      workspaceId: args.input.workspaceId,
    });
    return { folder };
  },
});
