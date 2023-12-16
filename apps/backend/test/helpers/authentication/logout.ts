import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

type Params = {
  graphql: TestContext;
  authorizationHeader: string;
};

export const logout = async ({ graphql, authorizationHeader }: Params) => {
  const authorizationHeaders = { authorization: authorizationHeader };
  const query = gql`
    mutation logout {
      logout {
        success
      }
    }
  `;
  const response = await graphql.client.request<any>(
    query,
    undefined,
    authorizationHeaders
  );
  return response;
};
