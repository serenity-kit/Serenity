import { clientLoginStart } from "@serenity-kit/opaque";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  username: string;
  password: string;
};

export const requestLoginChallengeResponse = async ({
  graphql,
  username,
  password,
}: Params) => {
  const clientLoginStartResult = clientLoginStart(password);
  const query = gql`
      mutation {
        startLogin(
          input: {
            username: "${username}"
            challenge: "${clientLoginStartResult.credentialRequest}"
          }
        ) {
          loginId
          challengeResponse
        }
      }
    `;
  const data = await graphql.client.request(query);
  return {
    data: data.startLogin,
    login: clientLoginStartResult.clientLogin,
  };
};
