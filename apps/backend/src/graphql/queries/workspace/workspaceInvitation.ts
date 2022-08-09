import { UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceInvitation } from "../../../database/workspace/getWorkspaceInvitation";
import { WorkspaceInvitation } from "../../types/workspace";

export const workspaceInvitation = queryField((t) => {
  t.field("workspaceInvitation", {
    type: WorkspaceInvitation,
    args: {
      id: nonNull(idArg()),
    },
    async resolve(_root, args, _context) {
      if (!args.id) {
        throw new UserInputError("Invalid input: id cannot be null");
      }
      const workspaceInvitationId = args.id;
      const workspaceInvitation = await getWorkspaceInvitation({
        workspaceInvitationId,
      });
      return workspaceInvitation;
    },
  });
});
