import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { initializeRegistration } from "../../../database/authentication/initializeRegistration";
import sodium from "libsodium-wrappers-sumo";

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
    t.nonNull.string("serverPublicKey");
    t.nonNull.string("oprfPublicKey");
    t.nonNull.string("oprfChallengeResponse");
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
      const b64ClientOprfChallenge = args.input.challenge;
      let clientOprfChallenge = new Uint8Array(32);
      try {
        clientOprfChallenge = sodium.from_base64(b64ClientOprfChallenge);
      } catch (error) {
        throw Error("challenge must be a base64-encoded byte array");
      }
      const { serverPublicKey, oprfPublicKey, oprfChallengeResponse } =
        await initializeRegistration(username, clientOprfChallenge);
      const result = {
        serverPublicKey: sodium.to_base64(serverPublicKey),
        oprfPublicKey: sodium.to_base64(oprfPublicKey),
        oprfChallengeResponse: sodium.to_base64(oprfChallengeResponse),
      };
      return result;
    },
  }
);
