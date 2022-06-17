import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createDevice } from "../../../database/device/createDevice";
import { Device } from "../../types/device";

export const CreateDeviceInput = inputObjectType({
  name: "CreateDeviceInput",
  definition(t) {
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
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
    const device = await createDevice({
      userId: context.user.id,
      signingPublicKey: args.input.signingPublicKey,
      encryptionPublicKey: args.input.encryptionPublicKey,
      encryptionPublicKeySignature: args.input.encryptionPublicKeySignature,
    });
    return { device };
  },
});
