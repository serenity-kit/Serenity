import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { AuthenticationError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { logout } from "../../../database/authentication/logout";
import { WorkspaceMemberDevicesProofInput } from "../../types/workspaceMemberDevicesProof";

export const LogoutInput = inputObjectType({
  name: "LogoutInput",
  definition(t) {
    t.nonNull.string("serializedUserChainEvent");
    t.nonNull.list.nonNull.field("workspaceMemberDevicesProofs", {
      type: WorkspaceMemberDevicesProofInput,
    });
  },
});

export const LogoutResult = objectType({
  name: "LogoutResult",
  definition(t) {
    t.nonNull.boolean("success");
  },
});

export const logoutMutation = mutationField("logout", {
  type: LogoutResult,
  args: {
    input: arg({ type: LogoutInput }),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const removeDeviceEvent = args.input
      ? userChain.RemoveDeviceEvent.parse(
          JSON.parse(args.input.serializedUserChainEvent)
        )
      : null;

    const workspaceMemberDevicesProofEntries = args.input
      ? args.input.workspaceMemberDevicesProofs.map((entry) => {
          return {
            workspaceId: entry.workspaceId,
            workspaceMemberDevicesProof:
              workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
                JSON.parse(entry.serializedWorkspaceMemberDevicesProof)
              ),
          };
        })
      : null;

    await logout({
      userId: context.user.id,
      sessionKey: context.session.sessionKey,
      removeDeviceEvent,
      workspaceMemberDevicesProofEntries,
    });

    return { success: true };
  },
});
