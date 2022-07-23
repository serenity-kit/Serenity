import { AuthenticationError } from "apollo-server-express";
import { arg, mutationField, inputObjectType, objectType } from "nexus";
import { deleteDevices } from "../../../database/device/deleteDevices";

export const DeleteDevicesResult = objectType({
  name: "DeleteDevicseResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const DeleteDevicesInput = inputObjectType({
  name: "DeleteDevicesInput",
  definition(t) {
    t.nonNull.list.nonNull.field("signingPublicKeys", {
      type: "String",
    });
  },
});

export const deleteDevicesMutation = mutationField("deleteDevices", {
  type: DeleteDevicesResult,
  args: {
    input: arg({
      type: DeleteDevicesInput,
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    await deleteDevices({
      userId: context.user.id,
      signingPublicKeys: args.input.signingPublicKeys,
    });
    return {
      status: "success",
    };
  },
});
