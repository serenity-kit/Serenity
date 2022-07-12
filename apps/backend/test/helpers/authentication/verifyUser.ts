import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  username: string;
  verificationCode: string;
};

export const verifyUser = async ({
  graphql,
  username,
  verificationCode,
}: Props) => {
  const verifyRegistrationQuery = gql`
    mutation verifyRegistration($input: VerifyRegistrationInput!) {
      verifyRegistration(input: $input) {
        id
      }
    }
  `;
  const verifyRegistrationResponse = await graphql.client.request(
    verifyRegistrationQuery,
    {
      input: {
        username,
        verificationCode,
      },
    }
  );
  return verifyRegistrationResponse;
};
