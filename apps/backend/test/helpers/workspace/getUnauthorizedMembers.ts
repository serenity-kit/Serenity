import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  input: { workspaceIds: string[] };
  sessionKey: string;
};
export const getUnauthorizedMembers = async ({
  graphql,
  input,
  sessionKey,
}: Props) => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query unauthorizedMembers($workspaceIds: [ID!]!) {
      unauthorizedMembers(workspaceIds: $workspaceIds) {
        userIds
      }
    }
  `;
  return await graphql.client.request(query, input, authorizationHeader);
};
