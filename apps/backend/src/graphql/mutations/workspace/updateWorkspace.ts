import { arg, inputObjectType, list, mutationField, objectType } from "nexus";
import { updateWorkspace } from "../../../database/workspace/updateWorkspace";
import { Workspace, WorkspaceMemberInput } from "../../types/workspace";

export const UpdateWorkspaceInput = inputObjectType({
  name: "UpdateWorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.list.nonNull.field("members", {
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
    input: arg({
      type: UpdateWorkspaceInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    if (args.input.name === null) {
      throw new Error("Invalid input: name cannot be null");
    }
    if (args.input.members === null) {
      throw new Error("Invalid input: members cannot be null");
    }
    console.log({ input: args.input });
    console.log({ inboundMembers: args.input.members });
    const workspace = await updateWorkspace({
      id: args.input.id,
      name: args.input.name,
      members: args.input.members,
      username: context.user.username,
    });
    return { workspace };
  },
});
