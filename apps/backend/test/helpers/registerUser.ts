import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { requestRegistrationChallengeResponse } from "./requestRegistrationChallengeResponse";

let result: any = null;

export const registerUser = async (
  graphql: any,
  username: string,
  password: string
) => {
  result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );

  const message = result.registration.finish(
    sodium.from_base64(result.data.challengeResponse)
  );
  const query = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
      finishRegistration(input: $input) {
        id
      }
    }
  `;

  const registrationResponse = await graphql.client.request(query, {
    input: {
      registrationId: result.data.registrationId,
      message: sodium.to_base64(message),
      clientPublicKey: "TODO",
    },
  });
  return {
    registrationResponse,
    clientPrivateKey: "TODO",
    clientPublicKey: "TODO",
  };
};
