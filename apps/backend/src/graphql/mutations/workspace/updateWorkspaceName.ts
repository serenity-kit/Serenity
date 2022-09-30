import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { updateWorkspaceName } from "../../../database/workspace/updateWorkspaceName";
import { Workspace } from "../../types/workspace";

export const UpdateWorkspaceNameInput = inputObjectType({
  name: "UpdateWorkspaceNameInput",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
  },
});

export const UpdateWorkspaceNameResult = objectType({
  name: "UpdateWorkspaceNameResult",
  definition(t) {
    t.field("workspace", { type: Workspace });
  },
});

export const updateWorkspaceNameMutation = mutationField(
  "updateWorkspaceName",
  {
    type: UpdateWorkspaceNameResult,
    args: {
      input: nonNull(
        arg({
          type: UpdateWorkspaceNameInput,
        })
      ),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const workspace = await updateWorkspaceName({
        id: args.input.id,
        name: args.input.name || undefined,
        userId: context.user.id,
      });
      return { workspace };
    },
  }
);
