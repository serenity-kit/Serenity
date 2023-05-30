import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";
import { Workspace } from "../../types/workspace";

export const AcceptWorkspaceInvitationInput = inputObjectType({
  name: "AcceptWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("invitationId");
    t.nonNull.string("acceptInvitationSignature");
    t.nonNull.string("acceptInvitationAuthorSignature");
    t.nonNull.string("inviteeMainDeviceSigningPublicKey");
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
        invitationId: args.input.invitationId,
        acceptInvitationSignature: args.input.acceptInvitationSignature,
        acceptInvitationAuthorSignature:
          args.input.acceptInvitationAuthorSignature,
        inviteeMainDeviceSigningPublicKey:
          args.input.inviteeMainDeviceSigningPublicKey,
        currentUserId: context.user.id,
      });
      return { workspace };
    },
  }
);
