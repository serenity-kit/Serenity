import canonicalize from "canonicalize";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
};

export const createWorkspaceInvitation = async ({
  graphql,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createWorkspaceInvitation(
      $input: CreateWorkspaceInvitationInput!
    ) {
      createWorkspaceInvitation(input: $input) {
        workspaceInvitation {
          id
          workspaceId
          inviterUserId
          expiresAt
        }
      }
    }
  `;

  // expires 48 hours in the future
  const invitationId = sodium.to_base64(sodium.randombytes_buf(24));
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const signingKeys = sodium.crypto_sign_keypair();

  const invitationData = canonicalize({
    workspaceId,
    invitationId,
    invitationSigningPublicKey: sodium.to_base64(signingKeys.publicKey),
    expiresAt,
  });
  const invitationDataSignature = sodium.crypto_sign_detached(
    invitationData!,
    signingKeys.privateKey
  );

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        invitationId,
        invitationSigningPublicKey: sodium.to_base64(signingKeys.publicKey),
        expiresAt,
        invitationDataSignature: sodium.to_base64(invitationDataSignature),
      },
    },
    authorizationHeaders
  );
  return {
    ...result,
    invitationSigningPrivateKey: sodium.to_base64(signingKeys.privateKey),
  };
};
