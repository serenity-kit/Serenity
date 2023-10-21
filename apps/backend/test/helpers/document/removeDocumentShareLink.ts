import * as documentChain from "@serenity-kit/document-chain";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { getLastDocumentChainEventByDocumentId } from "../documentChain/getLastDocumentChainEventByDocumentId";

export type Params = {
  graphql: any;
  documentId: string;
  deviceSigningPublicKey: string;
  mainDevice: LocalDevice;
  authorizationHeader: string;
};

export const removeDocumentShareLink = async ({
  graphql,
  documentId,
  deviceSigningPublicKey,
  mainDevice,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation removeDocumentShareLink($input: RemoveDocumentShareLinkInput!) {
      removeDocumentShareLink(input: $input) {
        success
      }
    }
  `;

  const { lastChainEvent } = await getLastDocumentChainEventByDocumentId({
    documentId,
  });

  const documentChainEvent = documentChain.removeShareDocumentDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: deviceSigningPublicKey,
    prevEvent: lastChainEvent,
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        serializedDocumentChainEvent: JSON.stringify(documentChainEvent),
      },
    },
    authorizationHeaders
  );
  return result;
};
