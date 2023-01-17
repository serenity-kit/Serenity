import { Registration } from "@serenity-tools/opaque-server";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";

export type RegistrationChallengeReponseType = {
  data: any;
  registration: Registration;
};

export const requestRegistrationChallengeResponse = async (
  graphql: any,
  username: string,
  password: string
): Promise<RegistrationChallengeReponseType> => {
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
