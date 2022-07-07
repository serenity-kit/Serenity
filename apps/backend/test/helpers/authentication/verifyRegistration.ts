import { gql } from "graphql-request";

export type Props = {
  graphql: any;
  username: string;
  confirmationCode: string;
};
export const verifyRegistration = async ({
  graphql,
  username,
  confirmationCode,
}: Props) => {
  const query = gql`
    mutation verifyRegistration($input: VerifyRegistrationInput!) {
      verifyRegistration(input: $input) {
        id
      }
    }
  `;

  const verifyRegistrationResponse = await graphql.client.request(query, {
    input: {
      username,
      verificationCode: confirmationCode,
    },
  });
  return verifyRegistrationResponse;
};
