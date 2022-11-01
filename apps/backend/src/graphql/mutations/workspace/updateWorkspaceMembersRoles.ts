import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateWorkspaceMembersRoles } from "../../../database/workspace/updateWorkspaceMembersRoles";
import { Workspace, WorkspaceMemberInput } from "../../types/workspace";

export const UpdateWorkspaceMembersRolesInput = inputObjectType({
  name: "UpdateWorkspaceMembersRolesInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("members", {
      type: WorkspaceMemberInput,
    });
  },
});

export const UpdateWorkspaceMembersRolesResult = objectType({
  name: "UpdateWorkspaceMembersRolesResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceMembersRolesMutation = mutationField(
  "updateWorkspaceMembersRoles",
  {
    type: UpdateWorkspaceMembersRolesResult,
    args: {
      input: nonNull(
        arg({
          type: UpdateWorkspaceMembersRolesInput,
        })
      ),
    },
    async resolve(root, args, context) {
      console.log({ members: args.input.members });
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const workspace = await updateWorkspaceMembersRoles({
        id: args.input.id,
        userId: context.user.id,
        members: args.input.members,
      });
      return { workspace };
    },
  }
);
