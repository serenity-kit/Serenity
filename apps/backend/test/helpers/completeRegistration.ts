import { gql } from "graphql-request";
import {
  createClientKeyPair,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";

export const completeRegistration = async (
  graphql: any,
  username: string,
  password: string,
  serverPublicKey: string,
  oprfPublicKey: string,
  serverChallengeResponse: string,
  randomScalar: string
) => {
  const clientKeys = createClientKeyPair();
  // crate cipher text
  const clientPrivateKey = clientKeys.privateKey;
  const clientPublicKey = clientKeys.publicKey;
  const { secret, nonce } = await createOprfRegistrationEnvelope(
    password,
    clientPublicKey,
    clientPrivateKey,
    randomScalar,
    serverChallengeResponse,
    serverPublicKey,
    oprfPublicKey
  );
  const query = gql`
      mutation {
        finalizeRegistration(
          input: {
            username: "${username}"
            secret: "${secret}"
            nonce: "${nonce}"
            clientPublicKey: "${clientPublicKey}"
          }
        ) {
          status
        }
      }
    `;
  await graphql.client.request(query);
  return {
    clientPrivateKey,
    clientPublicKey,
    secret,
    nonce,
  };
};
