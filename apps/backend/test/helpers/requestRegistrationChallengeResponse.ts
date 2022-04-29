import { gql } from "graphql-request";
import { createOprfChallenge } from "@serenity-tools/opaque/client";

export const requestRegistrationChallengeResponse = async (
  graphql: any,
  username: string,
  password: string
) => {
  const { oprfChallenge, randomScalar } = await createOprfChallenge(password);
  const query = gql`
      mutation {
        initializeRegistration(
          input: {
            username: "${username}"
            challenge: "${oprfChallenge}"
          }
        ) {
          serverPublicKey
          oprfPublicKey
          oprfChallengeResponse
        }
      }
    `;
  const data = await graphql.client.request(query);
  return {
    data: data.initializeRegistration,
    oprfChallenge,
    randomScalar,
  };
};
