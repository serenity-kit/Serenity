import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { startLogin } from "../../../utils/opaque";
import { getEnvelope } from "../../../database/authentication/getEnvelope";

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
    input: arg({
      type: StartLoginInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    const username = args.input.username;
    const result = await getEnvelope(username);

    try {
      const challengeResponse = startLogin(
        result.envelop,
        username,
        args.input.challenge
      );
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
