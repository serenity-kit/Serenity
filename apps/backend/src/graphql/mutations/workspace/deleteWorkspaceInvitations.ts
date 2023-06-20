import * as workspaceChain from "@serenity-kit/workspace-chain";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteWorkspaceInvitations } from "../../../database/workspace/deleteWorkspaceInvitations";

export const DeleteWorkspaceInvitationsInput = inputObjectType({
  name: "DeleteWorkspaceInvitationsInput",
  definition(t) {
    t.nonNull.string("serializedWorkspaceChainEvent");
  },
});

export const DeleteWorkspaceInvitationsResult = objectType({
  name: "DeleteWorkspaceInvitationsResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteWorkspaceInvitationsMutation = mutationField(
  "deleteWorkspaceInvitations",
  {
    type: DeleteWorkspaceInvitationsResult,
    args: {
      input: nonNull(
        arg({
          type: DeleteWorkspaceInvitationsInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const workspaceChainEvent =
        workspaceChain.RemoveInvitationsWorkspaceChainEvent.parse(
          JSON.parse(args.input.serializedWorkspaceChainEvent)
        );

      workspaceChain.assertAuthorOfEvent(
        workspaceChainEvent,
        context.user.mainDeviceSigningPublicKey
      );

      await deleteWorkspaceInvitations({ workspaceChainEvent });
      return { status: "success" };
    },
  }
);
