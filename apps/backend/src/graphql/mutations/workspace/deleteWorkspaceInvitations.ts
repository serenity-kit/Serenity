import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
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
    t.nonNull.string("serializedWorkspaceMemberDevicesProof");
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

      const workspaceMemberDevicesProof =
        workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
          JSON.parse(args.input.serializedWorkspaceMemberDevicesProof)
        );

      await deleteWorkspaceInvitations({
        workspaceChainEvent,
        userId: context.user.id,
        workspaceMemberDevicesProof,
        mainDeviceSigningPublicKey: context.user.mainDeviceSigningPublicKey,
      });
      return { status: "success" };
    },
  }
);
