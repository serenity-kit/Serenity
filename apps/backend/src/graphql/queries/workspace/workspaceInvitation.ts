import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceInvitation } from "../../../database/workspace/getWorkspaceInvitation";
import { formatWorkspaceInvitation } from "../../../types/workspace";
import { WorkspaceInvitation } from "../../types/workspace";

export const workspaceInvitationQuery = queryField((t) => {
  t.field("workspaceInvitation", {
    type: WorkspaceInvitation,
    args: {
      id: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      const workspaceInvitationId = args.id;
      const workspaceInvitation = await getWorkspaceInvitation({
        workspaceInvitationId,
      });
      return formatWorkspaceInvitation(workspaceInvitation);
    },
  });
});
