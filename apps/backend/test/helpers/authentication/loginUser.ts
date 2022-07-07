import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { requestLoginChallengeResponse } from "./requestLoginChallengeResponse";

type Params = {
  graphql: any;
  username: string;
  password: string;
};

export const loginUser = async ({ graphql, username, password }: Params) => {
  const startLoginResult = await requestLoginChallengeResponse({
    graphql,
    username,
    password,
  });
  const finishMessage = sodium.to_base64(
    startLoginResult.login.finish(
      sodium.from_base64(startLoginResult.data.challengeResponse)
    )
  );
  const finishLoginQuery = gql`
    mutation {
      finishLogin(
        input: {
          loginId: "${startLoginResult.data.loginId}"
          message: "${finishMessage}"
        }
      ) {
        expiresAt
      }
    }
  `;
  const loginResponse = await graphql.client.request(finishLoginQuery);

  return {
    sessionKey: sodium.to_base64(startLoginResult.login.getSessionKey()),
  };
};
