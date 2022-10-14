import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createFolder } from "../../../database/folder/createFolder";
import { KeyDerivationTrace } from "../../../types/folder";
import { Folder } from "../../types/folder";

export const KeyDerivationTraceParentFolderInput = inputObjectType({
  name: "KeyDerivationTraceParentFolderInput",
  definition(t) {
    t.nonNull.string("folderId");
    t.nonNull.int("subkeyId");
    t.string("parentFolderId");
  },
});

export const KeyDerivationTraceInput = inputObjectType({
  name: "KeyDerivationTraceInput",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("parentFolders", {
      type: KeyDerivationTraceParentFolderInput,
    });
  },
});

export const CreateFolderInput = inputObjectType({
  name: "CreateFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("encryptedName");
    t.nonNull.string("encryptedNameNonce");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.int("subkeyId");
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
      encryptedName: args.input.encryptedName,
      encryptedNameNonce: args.input.encryptedNameNonce,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId,
      parentFolderId: args.input.parentFolderId || undefined,
      workspaceId: args.input.workspaceId,
      keyDerivationTrace: args.input.keyDerivationTrace,
    });
    return {
      folder: {
        ...folder,
        keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace,
      },
    };
  },
});
