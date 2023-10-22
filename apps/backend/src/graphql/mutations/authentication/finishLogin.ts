import { ready as opaqueReady, server } from "@serenity-kit/opaque";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { addSessionKeyToLoginAttempt } from "../../../database/authentication/addSessionKeyToLoginAttempt";
import { getLoginAttempt } from "../../../database/authentication/getLoginAttempt";
import { getUserByUsername } from "../../../database/user/getUserByUsername";
import { getUserChainByUsername } from "../../../database/userChain/getUserChainByUsername";
import { UserChainEvent } from "../../types/userChain";

export const FinishLoginInput = inputObjectType({
  name: "FinishLoginInput",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("message");
  },
});

export const FinishLoginMainDevice = objectType({
  name: "FinishLoginMainDevice",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
  },
});

export const FinishLoginResult = objectType({
  name: "FinishLoginResult",
  definition(t) {
    t.nonNull.list.nonNull.field("userChain", {
      type: UserChainEvent,
    });
    t.nonNull.field("mainDevice", {
      type: FinishLoginMainDevice,
    });
  },
});

export const finishLoginMutation = mutationField("finishLogin", {
  type: FinishLoginResult,
  args: {
    input: nonNull(
      arg({
        type: FinishLoginInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }
    await opaqueReady;

    const loginAttempt = await getLoginAttempt({
      loginAttemptId: args.input.loginId,
    });
    const { sessionKey } = server.finishLogin({
      finishLoginRequest: args.input.message,
      serverLoginState: loginAttempt.startLoginServerData,
    });

    await addSessionKeyToLoginAttempt({
      loginId: args.input.loginId,
      sessionKey,
    });

    const userChain = await getUserChainByUsername({
      username: loginAttempt.username,
    });
    const user = await getUserByUsername({ username: loginAttempt.username });

    return {
      userChain,
      mainDevice: {
        ciphertext: user.mainDeviceCiphertext,
        nonce: user.mainDeviceNonce,
      },
    };
  },
});
