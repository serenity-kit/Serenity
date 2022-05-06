import { arg, inputObjectType, list, mutationField, objectType } from "nexus";
import { updateWorkspace } from "../../../database/workspace/updateWorkspace";
import { Workspace, WorkspaceMemberInput } from "../../types/workspace";

export const UpdateWorkspacesInput = inputObjectType({
  name: "UpdateWorkspacesInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.list.nonNull.field("members", {
      type: WorkspaceMemberInput,
    });
  },
});

export const UpdateWorkspacesResult = objectType({
  name: "UpdateWorkspacesResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceMutation = mutationField("updateWorkspace", {
  type: UpdateWorkspacesResult,
  args: {
    input: arg({
      type: UpdateWorkspacesInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    const workspace = await updateWorkspace({
      id: args.input.id,
      name: args.input.name,
      members: args.input.members,
      username: context.user.username,
    });
    return { workspace };
  },
});
