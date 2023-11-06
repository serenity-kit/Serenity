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
import { updateWorkspaceMemberRole } from "../../../database/workspace/updateWorkspaceMemberRole";
import { Workspace } from "../../types/workspace";

export const UpdateWorkspaceMemberRoleInput = inputObjectType({
  name: "UpdateWorkspaceMemberRoleInput",
  definition(t) {
    t.nonNull.string("workspaceId");
    t.nonNull.string("serializedWorkspaceChainEvent");
    t.nonNull.string("serializedWorkspaceMemberDevicesProof");
  },
});

export const UpdateWorkspaceMemberRoleResult = objectType({
  name: "UpdateWorkspaceMemberRoleResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceMemberRoleMutation = mutationField(
  "updateWorkspaceMemberRole",
  {
    type: UpdateWorkspaceMemberRoleResult,
    args: {
      input: nonNull(
        arg({
          type: UpdateWorkspaceMemberRoleInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const workspaceChainEvent =
        workspaceChain.UpdateMemberWorkspaceChainEvent.parse(
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

      const workspace = await updateWorkspaceMemberRole({
        workspaceId: args.input.workspaceId,
        userId: context.user.id,
        workspaceChainEvent,
        workspaceMemberDevicesProof,
        mainDeviceSigningPublicKey: context.user.mainDeviceSigningPublicKey,
      });
      return { workspace };
    },
  }
);
