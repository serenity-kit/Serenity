import {
  createCommentKey,
  Device,
  encryptComment,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  commentId: string;
  snapshotId: string;
  snapshotKey: string;
  comment: string;
  authorizationHeader: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  creatorDeviceSigningPrivateKey: string;
};

export const createCommentReply = async ({
  graphql,
  commentId,
  snapshotId,
  snapshotKey,
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
    mutation createCommentReply($input: CreateCommentReplyInput!) {
      createCommentReply(input: $input) {
        commentReply {
          id
          commentId
          documentId
          contentCiphertext
          contentNonce
          createdAt
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
        commentId,
        snapshotId,
        subkeyId: commentKey.subkeyId,
        contentCiphertext: ciphertext,
        contentNonce: publicNonce,
      },
    },
    authorizationHeaders
  );
  return result;
};
