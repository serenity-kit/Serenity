import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createMasterAndRecoveryDevice } from "../../../database/device/createMasterAndRecoveryDevice";

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

export const createMasterRecoveryDeviceMutation = mutationField(
  "createMasterRecoveryDevice",
  {
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
      const devices = await createMasterAndRecoveryDevice({
        userId: context.user.userId,
      });
      return devices;
    },
  }
);
