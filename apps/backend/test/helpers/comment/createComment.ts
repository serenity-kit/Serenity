import {
  createCommentKey,
  encryptAndSignComment,
  LocalDevice,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { getWorkspaceMemberDevicesProof } from "../../../src/database/workspace/getWorkspaceMemberDevicesProof";

type Params =
  | {
      graphql: any;
      documentId: string;
      workspaceId?: undefined;
      userId?: undefined;
      snapshotId: string;
      snapshotKey: string;
      documentShareLinkToken: string;
      comment: string;
      authorizationHeader: string;
      creatorDevice: LocalDevice;
      creatorDeviceEncryptionPrivateKey: string;
      creatorDeviceSigningPrivateKey: string;
    }
  | {
      graphql: any;
      documentId: string;
      workspaceId: string;
      userId: string;
      snapshotId: string;
      snapshotKey: string;
      documentShareLinkToken?: undefined;
      comment: string;
      authorizationHeader: string;
      creatorDevice: LocalDevice;
      creatorDeviceEncryptionPrivateKey: string;
      creatorDeviceSigningPrivateKey: string;
    };

export const createComment = async ({
  graphql,
  userId,
  workspaceId,
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

  const workspaceMemberDevicesProof = userId
    ? await getWorkspaceMemberDevicesProof({
        userId,
        workspaceId,
      })
    : undefined;

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
    workspaceMemberDevicesProof: workspaceMemberDevicesProof?.proof,
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
