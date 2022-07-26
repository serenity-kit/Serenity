import { AuthenticationError, UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { attachDeviceToWorkspace } from "../../../database/device/attachDeviceToWorkspace";
import { WorkspaceKey } from "../../types/workspace";

export const AttachDeviceToWorkspaceInput = inputObjectType({
  name: "AttachDeviceToWorkspaceInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const AttachDeviceToWorkspaceResult = objectType({
  name: "AttachDeviceToWorkspaceResult",
  definition(t) {
    t.field("workspaceKey", { type: WorkspaceKey });
  },
});

export const attachDeviceToWorkspaceMutation = mutationField(
  "attachDeviceToWorkspace",
  {
    type: AttachDeviceToWorkspaceResult,
    args: {
      input: arg({
        type: AttachDeviceToWorkspaceInput,
      }),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!args.input) {
        throw new UserInputError("Input missing");
      }
      if (!args.input.workspaceId) {
        throw new UserInputError("Invalid input: workspaceId cannot be null");
      }
      if (!args.input.signingPublicKey) {
        throw new UserInputError(
          "Invalid input: signingPublicKey cannot be null"
        );
      }
      if (!args.input.nonce) {
        throw new UserInputError("Invalid input: nonce cannot be null");
      }
      if (!args.input.ciphertext) {
        throw new UserInputError("Invalid input: ciphertext cannot be null");
      }
      const workspaceKey = await attachDeviceToWorkspace({
        userId: context.user.id,
        signingPublicKey: args.input.signingPublicKey,
        workspaceId: args.input.workspaceId,
        nonce: args.input.nonce,
        ciphertext: args.input.ciphertext,
      });
      return { workspaceKey };
    },
  }
);
