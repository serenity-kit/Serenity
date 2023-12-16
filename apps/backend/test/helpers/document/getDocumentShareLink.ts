import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type GetDocumentShareLinkParams = {
  graphql: TestContext;
  token: string;
};
export const getDocumentShareLink = async ({
  graphql,
  token,
}: GetDocumentShareLinkParams) => {
  const query = gql`
    query documentShareLink($token: ID!) {
      documentShareLink(token: $token) {
        token
        role
        deviceSecretBoxCiphertext
        deviceSecretBoxNonce
      }
    }
  `;
  return await graphql.client.request<any>(query, { token });
};
