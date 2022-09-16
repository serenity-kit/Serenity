import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { rotateWorkspaceKey } from "../../../database/workspace/rotateWorkspaceKey";
import { WorkspaceKey } from "../../types/workspace";
import { WorkspaceDeviceInput } from "../../types/workspaceDevice";

export const RotateWorkspaceKeyInput = inputObjectType({
  name: "RotateWorkspaceKeyInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: WorkspaceDeviceInput,
    });
  },
});

export const RotateWorkspaceKeyResult = objectType({
  name: "RotateWorkspaceKeyResult",
  definition(t) {
    t.nonNull.field("workspaceKey", {
      type: WorkspaceKey,
    });
  },
});

export const rotateWorkspaceKeyMutation = mutationField("rotateWorkspaceKey", {
  type: RotateWorkspaceKeyResult,
  args: {
    input: nonNull(
      arg({
        type: RotateWorkspaceKeyInput,
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

    const workspaceKey = await rotateWorkspaceKey({
      userId: context.user.id,
      workspaceId: args.input.workspaceId,
      creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
      deviceWorkspaceKeyBoxes: args.input.deviceWorkspaceKeyBoxes,
    });
    return { workspaceKey };
  },
});
