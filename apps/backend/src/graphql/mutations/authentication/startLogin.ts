import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { getEnvelope } from "../../../database/authentication/getEnvelope";
import { startLogin } from "../../../utils/opaque";

export const StartLoginInput = inputObjectType({
  name: "StartLoginInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const StartLoginResult = objectType({
  name: "StartLoginResult",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("challengeResponse");
  },
});

export const startLoginMutation = mutationField("startLogin", {
  type: StartLoginResult,
  args: {
    input: nonNull(
      arg({
        type: StartLoginInput,
      })
    ),
  },
  async resolve(root, args, context) {
    const username = args.input.username;
    const result = await getEnvelope(username);
    try {
      const challengeResponse = startLogin({
        envelope: result.envelop,
        username,
        challenge: args.input.challenge,
      });
      return {
        loginId: challengeResponse.loginId,
        challengeResponse: challengeResponse.message,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to initiate login.");
    }
  },
});
