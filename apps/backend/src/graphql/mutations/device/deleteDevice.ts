import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { deleteDevice } from "../../../database/device/deleteDevice";

export const CreateDeviceInput = inputObjectType({
  name: "CreateDeviceInput",
  definition(t) {
    t.nonNull.string("signingPublicKey");
  },
});

export const CreateDeviceResult = objectType({
  name: "CreateDeviceResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const createDeviceMutation = mutationField("createDevice", {
  type: CreateDeviceResult,
  args: {
    input: arg({
      type: CreateDeviceInput,
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
