import { client, ready as opaqueReady } from "@serenity-kit/opaque";
import { gql } from "graphql-request";

export type RegistrationChallengeResponse = {
  data: any;
  clientRegistrationState: string;
};

export const requestRegistrationChallengeResponse = async (
  graphql: any,
  username: string,
  password: string
): Promise<RegistrationChallengeResponse> => {
  await opaqueReady;
  const clientRegistrationStartResult = client.startRegistration({ password });
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
    clientRegistrationState:
      clientRegistrationStartResult.clientRegistrationState,
  };
};
