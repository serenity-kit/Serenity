import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDevice } from "../../../database/device/createDevice";
import { Device } from "../../types/device";

export const CreateDeviceInput = inputObjectType({
  name: "CreateDeviceInput",
  definition(t) {
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
    t.nonNull.string("info");
  },
});

export const CreateDeviceResult = objectType({
  name: "CreateDeviceResult",
  definition(t) {
    t.field("device", { type: Device });
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
      throw new Error("Input missing");
    }
    const device = await createDevice({
      userId: context.user.id,
      signingPublicKey: args.input.signingPublicKey,
      encryptionPublicKey: args.input.encryptionPublicKey,
      encryptionPublicKeySignature: args.input.encryptionPublicKeySignature,
      info: args.input.info,
    });
    if (!device.userId) {
      throw new Error("UserId missing");
    }
    return {
      device: {
        encryptionPublicKey: device.encryptionPublicKey,
        encryptionPublicKeySignature: device.encryptionPublicKeySignature,
        signingPublicKey: device.signingPublicKey,
        userId: device.userId,
        createdAt: device.createdAt,
        info: device.info,
      },
    };
  },
});
