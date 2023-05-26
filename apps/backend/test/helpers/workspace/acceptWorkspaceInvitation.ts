import canonicalize from "canonicalize";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Device } from "../../../src/types/device";

type Params = {
  graphql: any;
  workspaceInvitationId: string;
  inviteeUsername: string;
  inviteeMainDevice: Device;
  authorizationHeader: string;
  invitationSigningKeyPairSeed: string;
};

export const acceptWorkspaceInvitation = async ({
  graphql,
  workspaceInvitationId,
  inviteeUsername,
  inviteeMainDevice,
  authorizationHeader,
  invitationSigningKeyPairSeed,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation acceptWorkspaceInvitation(
      $input: AcceptWorkspaceInvitationInput!
    ) {
      acceptWorkspaceInvitation(input: $input) {
        workspace {
          id
          name
          members {
            userId
            username
            role
          }
        }
      }
    }
  `;
  const safeMainDevice = {
    signingPublicKey: inviteeMainDevice.signingPublicKey,
    encryptionPublicKey: inviteeMainDevice.encryptionPublicKey,
    encryptionPublicKeySignature:
      inviteeMainDevice.encryptionPublicKeySignature,
    userId: inviteeMainDevice.userId,
  };
  const inviteeUsernameAndDevice = canonicalize({
    username: inviteeUsername,
    mainDevice: {
      signingPublicKey: safeMainDevice.signingPublicKey,
      encryptionPublicKey: safeMainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: safeMainDevice.encryptionPublicKeySignature,
    },
  });

  const invitationSigningPrivateKey = sodium.crypto_sign_seed_keypair(
    sodium.from_base64(invitationSigningKeyPairSeed)
  ).privateKey;

  const inviteeUsernameAndDeviceSignature = sodium.crypto_sign_detached(
    inviteeUsernameAndDevice!,
    invitationSigningPrivateKey
  );

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceInvitationId,
        inviteeUsername,
        inviteeMainDevice: safeMainDevice,
        inviteeUsernameAndDeviceSignature: sodium.to_base64(
          inviteeUsernameAndDeviceSignature
        ),
      },
    },
    authorizationHeaders
  );
  return result;
};
