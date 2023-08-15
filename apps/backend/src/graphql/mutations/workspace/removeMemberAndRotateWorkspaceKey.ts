import * as workspaceChain from "@serenity-kit/workspace-chain";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { removeMemberAndRotateWorkspaceKey } from "../../../database/workspace/removeMemberAndRotateWorkspaceKey";
import { WorkspaceKey } from "../../types/workspace";
import { WorkspaceDeviceInput } from "../../types/workspaceDevice";

export const RemoveMemberAndRotateWorkspaceKeyInput = inputObjectType({
  name: "RemoveMemberAndRotateWorkspaceKeyInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("serializedWorkspaceChainEvent");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.list.nonNull.field("deviceWorkspaceKeyBoxes", {
      type: WorkspaceDeviceInput,
    });
  },
});

export const RemoveMemberAndRotateWorkspaceKeyResult = objectType({
  name: "RemoveMemberAndRotateWorkspaceKeyResult",
  definition(t) {
    t.nonNull.field("workspaceKey", {
      type: WorkspaceKey,
    });
  },
});

export const removeMemberAndRotateWorkspaceKeyMutation = mutationField(
  "removeMemberAndRotateWorkspaceKey",
  {
    type: RemoveMemberAndRotateWorkspaceKeyResult,
    args: {
      input: nonNull(
        arg({
          type: RemoveMemberAndRotateWorkspaceKeyInput,
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

      const workspaceChainEvent =
        workspaceChain.RemoveMemberWorkspaceChainEvent.parse(
          JSON.parse(args.input.serializedWorkspaceChainEvent)
        );

      workspaceChain.assertAuthorOfEvent(
        workspaceChainEvent,
        context.user.mainDeviceSigningPublicKey
      );

      const workspaceKey = await removeMemberAndRotateWorkspaceKey({
        userId: context.user.id,
        workspaceId: args.input.workspaceId,
        creatorDeviceSigningPublicKey: args.input.creatorDeviceSigningPublicKey,
        newDeviceWorkspaceKeyBoxes: args.input.deviceWorkspaceKeyBoxes,
        workspaceChainEvent,
      });
      return { workspaceKey };
    },
  }
);
