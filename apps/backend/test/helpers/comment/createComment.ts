import {
  createCommentKey,
  Device,
  encryptComment,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  snapshotId: string;
  snapshotKey: string;
  documentShareLinkToken?: string | null | undefined;
  comment: string;
  authorizationHeader: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  creatorDeviceSigningPrivateKey: string;
};

export const createComment = async ({
  graphql,
  snapshotId,
  snapshotKey,
  documentShareLinkToken,
  comment,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  creatorDeviceSigningPrivateKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const commentKey = createCommentKey({ snapshotKey });
  const { ciphertext, publicNonce } = encryptComment({
    comment,
    key: commentKey.key,
  });

  const query = gql`
    mutation createComment($input: CreateCommentInput!) {
      createComment(input: $input) {
        comment {
          id
          documentId
          contentCiphertext
          contentNonce
          createdAt
          snapshotId
          subkeyId
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            createdAt
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        snapshotId,
        subkeyId: commentKey.subkeyId,
        documentShareLinkToken,
        contentCiphertext: ciphertext,
        contentNonce: publicNonce,
      },
    },
    authorizationHeaders
  );
  return result;
};
