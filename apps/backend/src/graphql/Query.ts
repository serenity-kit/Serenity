import { arg, inputObjectType, objectType, queryType } from "nexus";
import { createOprfChallengeResponse, generateKeyPair } from "../utils/opaque";

const ClientOprfRegistrationChallengeInput = inputObjectType({
  name: "ClientOprfRegistrationChallengeRequest",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

const ClientOprfRegistrationChallengeResult = objectType({
  name: "ClientOprfRegistrationChallengeResult",
  definition(t) {
    t.nonNull.string("serverPubKey");
    t.nonNull.string("oprfPubKey");
    t.nonNull.string("challengeResponse");
  },
});

export const Query = queryType({
  definition(t) {
    t.string("test", {
      resolve(root, args, context) {
        return "hello";
      },
    });
  },
});
