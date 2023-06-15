import { clientRegistrationStart } from "@serenity-kit/opaque";
import { gql } from "graphql-request";

export type RegistrationChallengeResponseType = {
  data: any;
  registration: string;
};

export const requestRegistrationChallengeResponse = async (
  graphql: any,
  username: string,
  password: string
): Promise<RegistrationChallengeResponseType> => {
  const clientRegistrationStartResult = clientRegistrationStart(password);
  const query = gql`
    mutation startRegistration($input: StartRegistrationInput!) {
      startRegistration(input: $input) {
        challengeResponse
      }
    }
  `;
  const data = await graphql.client.request(query, {
    input: {
      username,
      challenge: clientRegistrationStartResult.registrationRequest,
    },
  });
  return {
    data: data.startRegistration,
    registration: clientRegistrationStartResult.clientRegistration,
  };
};
