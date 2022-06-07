import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDevice } from "../../../database/device/createDevice";

export const CreateDeviceInput = inputObjectType({
  name: "CreateDeviceInput",
  definition(t) {},
});

export const CreateDeviceResult = objectType({
  name: "CreateDeviceResult",
  definition(t) {
    t.nonNull.string("id");
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
    const device = await createDevice({
      userId: context.user.userId,
    });
    return device;
  },
});
