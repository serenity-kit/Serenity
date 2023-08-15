import { AuthenticationError } from "apollo-server-express";
import { objectType, queryField } from "nexus";

export const MainDeviceResult = objectType({
  name: "MainDeviceResult",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
  },
});

export const mainDeviceQuery = queryField((t) => {
  t.field("mainDevice", {
    type: MainDeviceResult,
    async resolve(root, args, context) {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      return {
        ciphertext: context.user.mainDeviceCiphertext,
        nonce: context.user.mainDeviceNonce,
      };
    },
  });
});
