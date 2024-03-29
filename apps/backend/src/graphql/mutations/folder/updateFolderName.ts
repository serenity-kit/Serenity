import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateFolderName } from "../../../database/folder/updateFolderName";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const UpdateFolderNameInput = inputObjectType({
  name: "UpdateFolderNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("signature");
    t.nonNull.string("workspaceMemberDevicesProofHash");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("subkeyId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTraceInput });
  },
});

export const UpdateFolderNameResult = objectType({
  name: "UpdateFolderNameResult",
  definition(t) {
    t.field("folder", { type: Folder });
  },
});

export const updateFolderNameMutation = mutationField("updateFolderName", {
  type: UpdateFolderNameResult,
  args: {
    input: nonNull(
      arg({
        type: UpdateFolderNameInput,
      })
    ),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const folder = await updateFolderName({
      id: args.input.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      signature: args.input.signature,
      workspaceMemberDevicesProofHash:
        args.input.workspaceMemberDevicesProofHash,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId,
      userId: context.user.id,
      keyDerivationTrace: args.input.keyDerivationTrace,
      sessionDeviceSigningPublicKey: context.session.deviceSigningPublicKey,
      userMainDeviceSigningPublicKey: context.user.mainDeviceSigningPublicKey,
    });
    return {
      folder: formatFolder(folder),
    };
  },
});
