import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createFolder } from "../../../database/folder/createFolder";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const CreateFolderInput = inputObjectType({
  name: "CreateFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("subkeyId");
    t.string("parentFolderId");
    t.nonNull.string("workspaceId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTraceInput });
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
    input: nonNull(
      arg({
        type: CreateFolderInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const folder = await createFolder({
      userId: context.user.id,
      id: args.input.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId,
      parentFolderId: args.input.parentFolderId || undefined,
      workspaceId: args.input.workspaceId,
      keyDerivationTrace: args.input.keyDerivationTrace,
    });
    return { folder: formatFolder(folder) };
  },
});
