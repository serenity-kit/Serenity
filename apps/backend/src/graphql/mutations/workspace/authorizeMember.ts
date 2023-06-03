import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { authorizeMember } from "../../../database/workspace/authorizeMember";
import { WorkspaceDeviceInput } from "../../types/workspaceDevice";

export const AddMemberWorkspaceKeyInput = inputObjectType({
  name: "AddMemberWorkspaceKeyInput",
  definition(t) {
    t.nonNull.string("workspaceKeyId");
    t.nonNull.list.nonNull.field("workspaceKeyBoxes", {
      type: WorkspaceDeviceInput,
    });
  },
});

export const AuthorizeMemberInput = inputObjectType({
  name: "AuthorizeMemberInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("workspaceKeys", {
      type: AddMemberWorkspaceKeyInput,
    });
  },
});

export const AuthorizeMemberResult = objectType({
  name: "AuthorizeMemberResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const authorizeMemberMutation = mutationField("authorizeMember", {
  type: AuthorizeMemberResult,
  args: {
    input: nonNull(
      arg({
        type: AuthorizeMemberInput,
      })
    ),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    context.assertValidDeviceSigningPublicKeyForThisSession(
      args.input.creatorDeviceSigningPublicKey
    );

    await authorizeMember({
      userId: context.user.id,
      workspaceId: args.input.workspaceId,
      creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
      workspaceKeys: args.input.workspaceKeys,
    });

    return { success: true };
  },
});
