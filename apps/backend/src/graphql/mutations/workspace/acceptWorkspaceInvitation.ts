import * as workspaceChain from "@serenity-kit/workspace-chain";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { acceptWorkspaceInvitation } from "../../../database/workspace/acceptWorkspaceInvitation";

export const AcceptWorkspaceInvitationInput = inputObjectType({
  name: "AcceptWorkspaceInvitationInput",
  definition(t) {
    t.nonNull.string("serializedWorkspaceChainEvent");
  },
});

export const AcceptWorkspaceInvitationResult = objectType({
  name: "AcceptWorkspaceInvitationResult",
  definition(t) {
    t.nonNull.string("workspaceId");
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

      const workspaceChainEvent =
        workspaceChain.AcceptInvitationWorkspaceChainEvent.parse(
          JSON.parse(args.input.serializedWorkspaceChainEvent)
        );

      workspaceChain.assertAuthorOfEvent(
        workspaceChainEvent,
        context.user.mainDeviceSigningPublicKey
      );

      const workspaceId = await acceptWorkspaceInvitation({
        workspaceChainEvent,
        currentUserId: context.user.id,
      });
      return { workspaceId };
    },
  }
);
