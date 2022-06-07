import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createMasterAndRecoveryDevice } from "../../../database/device/createMasterAndRecoveryDevice";

export const CreateMasterAndRecoveryDeviceInput = inputObjectType({
  name: "CreateMasterAndRecoveryDeviceInput",
  definition(t) {},
});

export const CreateMasterAndRecoveryDeviceResult = objectType({
  name: "CreateMasterAndRecoveryDeviceResult",
  definition(t) {
    t.nonNull.string("id");
  },
});

export const createMasterAndRecoveryDeviceMutation = mutationField(
  "createMasterAndRecoveryDevice",
  {
    type: CreateMasterAndRecoveryDeviceResult,
    args: {
      input: arg({
        type: CreateMasterAndRecoveryDeviceInput,
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
