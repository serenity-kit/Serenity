import { ApolloError } from "apollo-server-errors";

export class ExpectedGraphqlError extends ApolloError {
  constructor(message: string) {
    super(message, "EXPECTED_GRAPHQL_ERROR");
  }
}
