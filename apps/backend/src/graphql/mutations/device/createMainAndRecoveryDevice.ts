import { mutationField, objectType } from "nexus";
import { Device } from "../../types/device";
import { RecoveryDevice } from "../../types/recoveryDevice";

// export const CreateMainAndRecoveryDeviceResult = objectType({
//   name: "CreateMainAndRecoveryDeviceResult",
//   definition(t) {
//     t.field("device", { type: Device });
//     // t.field("recoveryDevice", { type: RecoveryDevice });
//   },
// });

export const CreateMainAndRecoveryDeviceResult = objectType({
  name: "CreateMainAndRecoveryDeviceResult",
  definition(t) {
    t.field("mainDevice", { type: Device });
    t.field("recoveryDevice", { type: RecoveryDevice });
  },
});

export const CreateMainAndRecoveryDeviceMutation = mutationField(
  "createMainAndRecoveryDevice",
  {
    type: CreateMainAndRecoveryDeviceResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      return null;
      // const devices = await createMainAndRecoveryDevice({
      //   userId: context.user.id,
      // });
      // return devices;
    },
  }
);
