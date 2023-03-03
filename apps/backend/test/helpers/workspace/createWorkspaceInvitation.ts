import canonicalize from "canonicalize";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { getRoleAsString } from "../../../src/utils/getRoleAsString";

type Params = {
  graphql: any;
  workspaceId: string;
  role: string;
  authorizationHeader: string;
};

export const createWorkspaceInvitation = async ({
  graphql,
  workspaceId,
  role,
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
          role
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
    role: getRoleAsString(role),
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
        role,
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
