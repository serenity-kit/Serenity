import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
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
      input: arg({
        type: AttachDeviceToWorkspacesInput,
      }),
    },
    async resolve(_root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.input) {
        throw new UserInputError("Input missing");
      }
      if (!args.input.receiverDeviceSigningPublicKey) {
        throw new UserInputError(
          "Invalid input: receiverDeviceSigningPublicKey cannot be null"
        );
      }
      if (!args.input.creatorDeviceSigningPublicKey) {
        throw new UserInputError(
          "Invalid input: creatorDeviceSigningPublicKey cannot be null"
        );
      }
      if (!args.input.deviceWorkspaceKeyBoxes) {
        throw new UserInputError(
          "Invalid input: deviceWorkspaceKeyBoxes cannot be null"
        );
      }
      const workspaceKeyBoxes = args.input.deviceWorkspaceKeyBoxes;
      workspaceKeyBoxes.forEach((workspaceKeyBox: any) => {
        if (!workspaceKeyBox.workspaceId) {
          throw new UserInputError(
            "Invalid input: workspaceKeyBoxes[i].workspaceId cannot be null"
          );
        }
        if (!workspaceKeyBox.ciphertext) {
          throw new UserInputError(
            "Invalid input: workspaceKeyBoxes[i].ciphertext cannot be null"
          );
        }
        if (!workspaceKeyBox.nonce) {
          throw new UserInputError(
            "Invalid input: workspaceKeyBoxes[i].nonce cannot be null"
          );
        }
      });
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
