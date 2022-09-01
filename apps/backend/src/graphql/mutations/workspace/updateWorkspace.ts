import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateWorkspace } from "../../../database/workspace/updateWorkspace";
import { Workspace, WorkspaceMemberInput } from "../../types/workspace";

export const UpdateWorkspaceInput = inputObjectType({
  name: "UpdateWorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.nonNull.list.nonNull.field("members", {
      type: WorkspaceMemberInput,
    });
  },
});

export const UpdateWorkspaceResult = objectType({
  name: "UpdateWorkspaceResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceMutation = mutationField("updateWorkspace", {
  type: UpdateWorkspaceResult,
  args: {
    input: nonNull(
      arg({
        type: UpdateWorkspaceInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    const workspace = await updateWorkspace({
      id: args.input.id,
      name: args.input.name || undefined,
      members: args.input.members,
      userId: context.user.id,
    });
    return { workspace };
  },
});
