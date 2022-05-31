import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { Registration } from "../../src/vendor/opaque-wasm/opaque_wasm";

export type RegistrationChallengeRepoonseType = {
  data: any;
  registration: Registration;
};

export const requestRegistrationChallengeResponse = async (
  graphql: any,
  username: string,
  password: string
): Promise<RegistrationChallengeRepoonseType> => {
  const registration = new Registration();
  const challenge = registration.start(password);
  const query = gql`
    mutation startRegistration($input: StartRegistrationInput!) {
      startRegistration(input: $input) {
        challengeResponse
        registrationId
      }
    }
  `;
  const data = await graphql.client.request(query, {
    input: { username, challenge: sodium.to_base64(challenge) },
  });
  return {
    data: data.startRegistration,
    registration,
  };
};
