import * as workspaceChain from "@serenity-kit/workspace-chain";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createWorkspaceInvitation } from "../../../database/workspace/createWorkspaceInvitation";
import { formatWorkspaceInvitation } from "../../../types/workspace";
import { WorkspaceInvitation } from "../../types/workspace";

export const CreateWorkspaceInvitationInput = inputObjectType({
  name: "CreateWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("serializedWorkspaceChainEvent");
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

      const workspaceChainEvent =
        workspaceChain.AddInvitationWorkspaceChainEvent.parse(
          JSON.parse(args.input.serializedWorkspaceChainEvent)
        );

      workspaceChain.assertAuthorOfEvent(
        workspaceChainEvent,
        context.user.mainDeviceSigningPublicKey
      );

      const workspaceInvitation = await createWorkspaceInvitation({
        workspaceId: args.input.workspaceId,
        inviterUserId: context.user.id,
        workspaceChainEvent,
      });
      return {
        workspaceInvitation: formatWorkspaceInvitation(workspaceInvitation),
      };
    },
  }
);
