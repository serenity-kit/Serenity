import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { attachDevicesToWorkspaces } from "../../../database/device/attachDevicesToWorkspaces";
import {
  WorkspaceDevicePairingInput,
  WorkspaceWithWorkspaceKeys,
} from "../../types/workspaceDevice";

export const AttachDevicesToWorkspacesInput = inputObjectType({
  name: "AttachDevicesToWorkspacesInput",
  definition(t) {
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("workspaceMemberDevices", {
      type: WorkspaceDevicePairingInput,
    });
  },
});

export const AttachDevicesToWorkspacesResult = objectType({
  name: "AttachDevicesToWorkspacesResult",
  definition(t) {
    t.nonNull.list.nonNull.field("workspaces", {
      type: WorkspaceWithWorkspaceKeys,
    });
  },
});

export const attachDevicesToWorkspacesMutation = mutationField(
  "attachDevicesToWorkspaces",
  {
    type: AttachDevicesToWorkspacesResult,
    args: {
      input: nonNull(
        arg({
          type: AttachDevicesToWorkspacesInput,
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
      // build workspaceDevicePairings
      const workspaceMemberKeyBoxes = await attachDevicesToWorkspaces({
        userId: context.user.id,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        workspaceMemberDevices: args.input.workspaceMemberDevices,
      });

      return { workspaces: workspaceMemberKeyBoxes };
    },
  }
);
