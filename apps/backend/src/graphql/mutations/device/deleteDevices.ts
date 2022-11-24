import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { deleteDevices } from "../../../database/device/deleteDevices";
import { WorkspaceWithWorkspaceDevicesParingInput } from "../../types/workspaceDevice";

export const DeleteDevicesResult = objectType({
  name: "DeleteDevicesResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const DeleteDevicesInput = inputObjectType({
  name: "DeleteDevicesInput",
  definition(t) {
    t.nonNull.string("creatorSigningPublicKey");
    t.nonNull.list.nonNull.string("deviceSigningPublicKeysToBeDeleted");
    t.nonNull.list.nonNull.field("newDeviceWorkspaceKeyBoxes", {
      type: WorkspaceWithWorkspaceDevicesParingInput,
    });
  },
});

export const deleteDevicesMutation = mutationField("deleteDevices", {
  type: DeleteDevicesResult,
  args: {
    input: nonNull(
      arg({
        type: DeleteDevicesInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    context.assertValidDeviceSigningPublicKeyForThisSession(
      args.input.creatorSigningPublicKey
    );
    await deleteDevices({
      userId: context.user.id,
      creatorDeviceSigningPublicKey: args.input.creatorSigningPublicKey,
      newDeviceWorkspaceKeyBoxes: args.input.newDeviceWorkspaceKeyBoxes,
      deviceSigningPublicKeysToBeDeleted:
        args.input.deviceSigningPublicKeysToBeDeleted,
    });
    return {
      status: "success",
    };
  },
});
