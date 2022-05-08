import { gql } from "graphql-request";
import {
  createClientKeyPair,
  createOprfRegistrationEnvelope,
} from "@serenity-tools/opaque/client";
import { requestRegistrationChallengeResponse } from "./requestRegistrationChallengeResponse";

export const registerUser = async (
  graphql: any,
  username: string,
  password: string,
  workspaceId: string
) => {
  const result = await requestRegistrationChallengeResponse(
    graphql,
    username,
    password
  );
  const data = result.data;
  const randomScalar = result.randomScalar;

  const clientKeys = createClientKeyPair();
  // crate cipher text
  const clientPublicKey = clientKeys.publicKey;
  const clientPrivateKey = clientKeys.privateKey;
  const registrationEnvelopeData = await createOprfRegistrationEnvelope(
    password,
    clientPublicKey,
    clientPrivateKey,
    randomScalar,
    data.oprfChallengeResponse,
    data.serverPublicKey,
    data.oprfPublicKey
  );
  const query = gql`
    mutation {
      finalizeRegistration(
        input: {
          username: "${username}"
          secret: "${registrationEnvelopeData.secret}"
          nonce: "${registrationEnvelopeData.nonce}"
          clientPublicKey: "${clientKeys.publicKey}"
          workspaceId: "${workspaceId}"
        }
      ) {
        status
      }
    }
  `;
  const registrationResponse = await graphql.client.request(query);
  return {
    registrationResponse,
    clientPublicKey,
    clientPrivateKey,
  };
};
