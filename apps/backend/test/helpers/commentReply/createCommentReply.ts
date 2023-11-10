import {
  LocalDevice,
  createCommentKey,
  encryptAndSignCommentReply,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  commentId: string;
  snapshotId: string;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
  snapshotKey: string;
  comment: string;
  authorizationHeader: string;
  creatorDevice: LocalDevice;
  creatorDeviceEncryptionPrivateKey: string;
  creatorDeviceSigningPrivateKey: string;
};

export const createCommentReply = async ({
  graphql,
  commentId,
  documentId,
  snapshotId,
  documentShareLinkToken,
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
  const { ciphertext, nonce, commentReplyId, signature } =
    encryptAndSignCommentReply({
      text: comment,
      commentId,
      key: commentKey.key,
      device: creatorDevice,
      documentId,
      snapshotId,
      subkeyId: commentKey.subkeyId,
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
        documentShareLinkToken,
        subkeyId: commentKey.subkeyId,
        contentCiphertext: ciphertext,
        contentNonce: nonce,
        commentReplyId,
        signature,
      },
    },
    authorizationHeaders
  );
  return result;
};
