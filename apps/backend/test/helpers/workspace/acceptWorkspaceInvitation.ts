import canonicalize from "canonicalize";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Device } from "../../../src/types/device";

type Params = {
  graphql: any;
  workspaceInvitationId: string;
  inviteeUsername: string;
  inviteeMainDevice: Device;
  invitationSigningPrivateKey: string;
  authorizationHeader: string;
};

export const acceptWorkspaceInvitation = async ({
  graphql,
  workspaceInvitationId,
  inviteeUsername,
  inviteeMainDevice,
  invitationSigningPrivateKey,
  authorizationHeader,
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
  const inviteeUsernameAndDeviceSignature = sodium.crypto_sign_detached(
    inviteeUsernameAndDevice!,
    sodium.from_base64(invitationSigningPrivateKey)
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
