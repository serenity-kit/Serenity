import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createWorkspaceInvitation } from "../../../database/workspace/createWorkspaceInvitation";
import { WorkspaceInvitation } from "../../types/workspace";

export const CreateWorkspaceInvitationInput = inputObjectType({
  name: "CreateWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("invitationId");
    t.nonNull.string("invitationSigningPublicKey");
    t.nonNull.string("invitationDataSignature");
    t.nonNull.field("expiresAt", { type: "Date" });
  },
});

export const CreateWorkspaceInvitationResult = objectType({
  name: "CreateWorkspaceInvitationResult",
  definition(t) {
    t.field("workspaceInvitation", { type: WorkspaceInvitation });
  },
});

export const createWorkspaceInvitationMutation = mutationField(
  "createWorkspaceInvitation",
  {
    type: CreateWorkspaceInvitationResult,
    args: {
      input: nonNull(
        arg({
          type: CreateWorkspaceInvitationInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const workspaceInvitation = await createWorkspaceInvitation({
        workspaceId: args.input.workspaceId,
        invitationId: args.input.invitationId,
        invitationSigningPublicKey: args.input.invitationSigningPublicKey,
        expiresAt: args.input.expiresAt,
        invitationDataSignature: args.input.invitationDataSignature,
        inviterUserId: context.user.id,
      });
      return { workspaceInvitation };
    },
  }
);
