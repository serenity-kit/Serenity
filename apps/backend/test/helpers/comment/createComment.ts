import {
  createCommentKey,
  encryptAndSignComment,
  LocalDevice,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  snapshotId: string;
  snapshotKey: string;
  documentShareLinkToken?: string | null | undefined;
  comment: string;
  authorizationHeader: string;
  creatorDevice: LocalDevice;
  creatorDeviceEncryptionPrivateKey: string;
  creatorDeviceSigningPrivateKey: string;
};

export const createComment = async ({
  graphql,
  documentId,
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
  const { ciphertext, nonce, commentId, signature } = encryptAndSignComment({
    text: comment,
    key: commentKey.key,
    device: creatorDevice,
    documentId,
    from: 0,
    to: 10,
    snapshotId,
    subkeyId: commentKey.subkeyId,
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
        contentNonce: nonce,
        commentId,
        signature,
      },
    },
    authorizationHeaders
  );
  return result;
};
