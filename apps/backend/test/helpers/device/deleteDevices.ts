import { gql } from "graphql-request";

type Params = {
  graphql: any;
  signingPublicKeys: string[];
  authorizationHeader: string;
};

export const deleteDevices = async ({
  graphql,
  signingPublicKeys,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
  mutation {
    deleteDevices(
      input: {
        signingPublicKeys: "${signingPublicKeys}"
      }
    ) {
      status
    }
  }
`;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  return result;
};
