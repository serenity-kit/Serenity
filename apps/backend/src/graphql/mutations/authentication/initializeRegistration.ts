import { arg, inputObjectType, mutationField, objectType } from "nexus";
import sodium from "libsodium-wrappers-sumo";
import { HandleRegistration } from "../../../vendor/opaque-wasm/opaque_wasm";
import { opaqueServerSetup } from "../../../utils/opaqueServerSetup";
import { Registration } from "../../../vendor/opaque-wasm/opaque_wasm";

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
      console.log("PRE SERVER");
      const serverRegistration = new HandleRegistration(opaqueServerSetup());
      console.log("POST SERVER");

      const registration = new Registration();
      const registration_tx = registration.start("weeee");

      console.log(args.input.challenge);
      console.log(sodium.from_base64(args.input.challenge));

      const registrationResponse = serverRegistration.start(
        username,
        sodium.from_base64(args.input.challenge)
      );
      console.log("POST MEssage");
      console.log("weee", registrationResponse);
      return {
        challengeResponse: sodium.to_base64(registrationResponse),
      };
    },
  }
);
