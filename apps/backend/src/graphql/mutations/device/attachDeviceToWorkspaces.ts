import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { attachDeviceToWorkspaces } from "../../../database/device/attachDeviceToWorkspaces";
import { WorkspaceKey } from "../../types/workspace";

export const DeviceWorkspaceKeyBoxInput = inputObjectType({
  name: "WorkspaceKeyBoxData",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const AttachDeviceToWorkspacesInput = inputObjectType({
  name: "AttachDeviceToWorkspacesInput",
  definition(t) {
    t.nonNull.string("receiverDeviceSigningPublicKey");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: DeviceWorkspaceKeyBoxInput,
    });
  },
});

export const AttachDeviceToWorkspacesResult = objectType({
  name: "AttachDeviceToWorkspacesResult",
  definition(t) {
    t.nonNull.list.nonNull.field("workspaceKeys", {
      type: WorkspaceKey,
    });
  },
});

export const attachDeviceToWorkspacesMutation = mutationField(
  "attachDeviceToWorkspaces",
  {
    type: AttachDeviceToWorkspacesResult,
    args: {
      input: nonNull(
        arg({
          type: AttachDeviceToWorkspacesInput,
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

      const workspaceKeys = await attachDeviceToWorkspaces({
        userId: context.user.id,
        receiverDeviceSigningPublicKey:
          args.input.receiverDeviceSigningPublicKey,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        workspaceKeyBoxes: args.input.deviceWorkspaceKeyBoxes,
      });
      return { workspaceKeys };
    },
  }
);
