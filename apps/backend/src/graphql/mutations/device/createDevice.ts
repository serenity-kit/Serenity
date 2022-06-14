import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { Device } from "../../types/device";

export const CreateDeviceResult = objectType({
  name: "CreateDeviceResult",
  definition(t) {
    t.field("device", { type: Device });
  },
});

export const createDeviceMutation = mutationField("createDevice", {
  type: CreateDeviceResult,
  async resolve(root, args, context) {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    return null;
    // const device = await createDevice({
    //   userId: context.user.id,
    // });
    // return { device };
  },
});
