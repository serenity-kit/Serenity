import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { authorizeDevices } from "../../../database/device/authorizeDevices";
import { WorkspaceWithWorkspaceDevicesParingInput } from "../../types/workspaceDevice";

export const AuthorizeDevicesResult = objectType({
  name: "AuthorizeDevicesResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const AuthorizeDevicesInput = inputObjectType({
  name: "AuthorizeDevicesInput",
  definition(t) {
    t.nonNull.string("creatorSigningPublicKey");
    t.nonNull.list.nonNull.field("newDeviceWorkspaceKeyBoxes", {
      type: WorkspaceWithWorkspaceDevicesParingInput,
    });
  },
});

export const authorizeDevicesMutation = mutationField("authorizeDevices", {
  type: AuthorizeDevicesResult,
  args: {
    input: nonNull(
      arg({
        type: AuthorizeDevicesInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    await authorizeDevices({
      userId: context.user.id,
      creatorDeviceSigningPublicKey: args.input.creatorSigningPublicKey,
      newDeviceWorkspaceKeyBoxes: args.input.newDeviceWorkspaceKeyBoxes,
    });
    return {
      status: "success",
    };
  },
});
