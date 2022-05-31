import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { startLogin } from "../../../utils/opaque";
import { getEnvelope } from "../../../database/authentication/getEnvelope";

export const ClientOprfLoginChallengeInput = inputObjectType({
  name: "ClientOprfLoginChallengeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const ClientOprfLoginChallengeResult = objectType({
  name: "ClientOprfLoginChallengeResult",
  definition(t) {
    t.nonNull.string("challengeResponse");
  },
});

export const initializeLoginMutation = mutationField("initializeLogin", {
  type: ClientOprfLoginChallengeResult,
  args: {
    input: arg({
      type: ClientOprfLoginChallengeInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    const username = args.input.username;

    const result = await getEnvelope(username);

    console.log(result);

    const challengeResponse = await startLogin(
      result.envelop,
      username,
      args.input.challenge
    );

    return {
      challengeResponse,
    };
  },
});
