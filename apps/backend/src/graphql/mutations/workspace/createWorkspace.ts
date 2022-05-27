import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createWorkspace } from "../../../database/workspace/createWorkspace";
import { Workspace } from "../../types/workspace";

export const CreateWorkspaceInput = inputObjectType({
  name: "CreateWorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
  },
});

export const CreateWorkspaceResult = objectType({
  name: "CreateWorkspaceResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const createWorkspaceMutation = mutationField("createWorkspace", {
  type: CreateWorkspaceResult,
  args: {
    input: arg({
      type: CreateWorkspaceInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    const workspace = await createWorkspace({
      id: args.input.id,
      name: args.input.name,
      userId: context.user.id,
    });
    return { workspace };
  },
});
