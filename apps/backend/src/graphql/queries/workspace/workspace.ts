import { idArg, queryField } from "nexus";
import { getWorkspace } from "../../../database/workspace/getWorkspace";
import { getWorkspaces } from "../../../database/workspace/getWorkspaces";
import { Workspace } from "../../types/workspace";

export const workspaces = queryField((t) => {
  t.field("workspace", {
    type: Workspace,
    args: {
      id: idArg(),
    },
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const username = context.user.username;
      if (args.id) {
        return await getWorkspace({
          username,
          id: args.id,
        });
      }

      const workspaces = await getWorkspaces({
        username,
        cursor: undefined,
        skip: undefined,
        take: 1,
      });
      if (workspaces.length > 0) {
        return workspaces[0];
      }
      return null;
    },
  });
});
