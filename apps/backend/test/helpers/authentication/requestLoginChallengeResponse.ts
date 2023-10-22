import { client, ready as opaqueReady } from "@serenity-kit/opaque";
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
  await opaqueReady;
  const clientLoginStartResult = client.startLogin({ password });
  const query = gql`
      mutation {
        startLogin(
          input: {
            username: "${username}"
            challenge: "${clientLoginStartResult.startLoginRequest}"
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
    clientLoginState: clientLoginStartResult.clientLoginState,
  };
};
