import { arg, inputObjectType, mutationField, objectType } from "nexus";
import sodium from "libsodium-wrappers-sumo";
import { startRegistration } from "../../../utils/opaque";

export const ClientOprfRegistrationChallengeInput = inputObjectType({
  name: "ClientOprfRegistrationChallengeRequest",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const ClientOprfRegistrationChallengeResult = objectType({
  name: "ClientOprfRegistrationChallengeResult",
  definition(t) {
    t.nonNull.string("challengeResponse");
  },
});

export const initializeRegistrationMutation = mutationField(
  "initializeRegistration",
  {
    type: ClientOprfRegistrationChallengeResult,
    args: {
      input: arg({
        type: ClientOprfRegistrationChallengeInput,
      }),
    },
    async resolve(root, args, context) {
      if (!args || !args.input) {
        throw Error("Missing input");
      }
      const username = args.input.username;
      if (username === "") {
        throw Error("Username cannot be empty");
      }
      const response = await startRegistration(username, args.input.challenge);
      return {
        challengeResponse: sodium.to_base64(response),
      };
    },
  }
);
