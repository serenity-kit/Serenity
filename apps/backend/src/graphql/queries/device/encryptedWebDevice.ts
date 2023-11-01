import { nonNull, objectType, queryField, stringArg } from "nexus";
import { getEncryptedWebDeviceByAccessToken } from "../../../database/device/getEncryptedWebDeviceByAccessToken";

export const EncryptedWebDeviceResult = objectType({
  name: "EncryptedWebDeviceResult",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
  },
});

export const encryptedWebDeviceQuery = queryField((t) => {
  t.field("encryptedWebDevice", {
    type: EncryptedWebDeviceResult,
    args: {
      accessToken: nonNull(stringArg()),
    },
    async resolve(root, args, context) {
      const result = await getEncryptedWebDeviceByAccessToken({
        webDeviceAccessToken: args.accessToken,
      });
      if (result.webDeviceCiphertext && result.webDeviceNonce) {
        return {
          ciphertext: result.webDeviceCiphertext,
          nonce: result.webDeviceNonce,
        };
      }
      return null;
    },
  });
});
