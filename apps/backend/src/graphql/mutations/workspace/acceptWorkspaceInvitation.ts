import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";
import { DeviceInput } from "../../types/device";
import { Workspace } from "../../types/workspace";

export const AcceptWorkspaceInvitationInput = inputObjectType({
  name: "AcceptWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceInvitationId");
    t.nonNull.string("inviteeUsername");
    t.nonNull.field("inviteeMainDevice", { type: DeviceInput });
    t.nonNull.string("inviteeUsernameAndDeviceSignature");
  },
});

export const AcceptWorkspaceInvitationResult = objectType({
  name: "AcceptWorkspaceInvitationResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const createWorkspaceInvitationMutation = mutationField(
  "acceptWorkspaceInvitation",
  {
    type: AcceptWorkspaceInvitationResult,
    args: {
      input: nonNull(
        arg({
          type: AcceptWorkspaceInvitationInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const workspace = await acceptWorkspaceInvitation({
        workspaceInvitationId: args.input.workspaceInvitationId,
        inviteeUsername: args.input.inviteeUsername,
        inviteeMainDevice: args.input.inviteeMainDevice,
        inviteeUsernameAndDeviceSignature:
          args.input.inviteeUsernameAndDeviceSignature,
        userId: context.user.id,
      });
      return { workspace };
    },
  }
);
