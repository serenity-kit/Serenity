import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { Login } from "@serenity-tools/opaque-server";

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
  const login = new Login();
  const challenge = sodium.to_base64(login.start(password));
  const query = gql`
      mutation {
        startLogin(
          input: {
            username: "${username}"
            challenge: "${challenge}"
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
    login,
  };
};
