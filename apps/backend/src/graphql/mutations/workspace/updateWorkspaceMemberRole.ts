import * as workspaceChain from "@serenity-kit/workspace-chain";
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

      const workspace = await updateWorkspaceMemberRole({
        workspaceId: args.input.workspaceId,
        userId: context.user.id,
        workspaceChainEvent,
      });
      return { workspace };
    },
  }
);
