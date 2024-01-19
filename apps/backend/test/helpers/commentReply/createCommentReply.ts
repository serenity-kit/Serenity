import {
  LocalDevice,
  createCommentKey,
  encryptAndSignCommentReply,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { getWorkspaceMemberDevicesProof } from "../../../src/database/workspace/getWorkspaceMemberDevicesProof";

type Params =
  | {
      graphql: any;
      userId?: undefined;
      workspaceId?: undefined;
      commentId: string;
      snapshotId: string;
      documentId: string;
      documentShareLinkToken: string;
      snapshotKey: string;
      comment: string;
      authorizationHeader: string;
      creatorDevice: LocalDevice;
      creatorDeviceEncryptionPrivateKey: string;
      creatorDeviceSigningPrivateKey: string;
    }
  | {
      graphql: any;
      userId: string;
      workspaceId: string;
      commentId: string;
      snapshotId: string;
      documentId: string;
      documentShareLinkToken?: undefined;
      snapshotKey: string;
      comment: string;
      authorizationHeader: string;
      creatorDevice: LocalDevice;
      creatorDeviceEncryptionPrivateKey: string;
      creatorDeviceSigningPrivateKey: string;
    };

export const createCommentReply = async ({
  graphql,
  workspaceId,
  userId,
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

  const workspaceMemberDevicesProof = userId
    ? await getWorkspaceMemberDevicesProof({
        userId,
        workspaceId,
      })
    : undefined;

  const { ciphertext, nonce, commentReplyId, signature } =
    encryptAndSignCommentReply({
      text: comment,
      commentId,
      key: commentKey.key,
      device: creatorDevice,
      documentId,
      snapshotId,
      subkeyId: commentKey.subkeyId,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof?.proof,
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
