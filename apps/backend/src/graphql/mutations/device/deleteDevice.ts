import { arg, mutationField, nonNull, objectType, idArg } from "nexus";
import { deleteDevice } from "../../../database/device/deleteDevice";

export const DeleteDeviceResult = objectType({
  name: "DeleteDeviceResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const deleteDeviceMutation = mutationField("deleteDevice", {
  type: DeleteDeviceResult,
  args: {
    input: arg({
      type: nonNull(idArg()),
    }),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    if (!args.input) {
      throw new Error("Invalid input");
    }
    await deleteDevice({
      userId: context.user.userId,
      signingPublicKey: args.input.signingPublicKey,
    });
    return {
      status: "success",
    };
  },
});
