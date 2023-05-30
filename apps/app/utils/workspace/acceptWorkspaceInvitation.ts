import * as workspaceChain from "@serenity-kit/workspace-chain";
import { LocalDevice } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import {
  Role as RoleEnum,
  Workspace,
  runAcceptWorkspaceInvitationMutation,
  runMeQuery,
} from "../../generated/graphql";

type Role = `${RoleEnum}`;

export type Props = {
  mainDevice: LocalDevice;
  signingKeyPairSeed: string;
  expiresAt: string;
  invitationId: string;
  workspaceId: string;
  role: Role;
  invitationDataSignature: string;
  invitationSigningPublicKey: string;
};

export const acceptWorkspaceInvitation = async ({
  mainDevice,
  signingKeyPairSeed,
  expiresAt,
  invitationId,
  workspaceId,
  invitationDataSignature,
  invitationSigningPublicKey,
  role,
}: Props): Promise<Workspace | undefined> => {
  const meResult = await runMeQuery({});
  if (!meResult.data?.me) {
    throw new Error(meResult.error?.message || "Could not fetch me");
  }
  const me = meResult.data.me;
  const safeMainDevice = {
    userId: me.id,
    signingPublicKey: mainDevice.signingPublicKey,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
    encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
  };

  const { acceptInvitationSignature, acceptInvitationAuthorSignature } =
    workspaceChain.acceptInvitation({
      invitationSigningKeyPairSeed: signingKeyPairSeed,
      expiresAt: new Date(expiresAt),
      invitationId,
      role,
      workspaceId,
      invitationDataSignature,
      invitationSigningPublicKey,
      authorKeyPair: {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
    });

  const result = await runAcceptWorkspaceInvitationMutation(
    {
      input: {
        invitationId,
        acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
        acceptInvitationAuthorSignature: sodium.to_base64(
          acceptInvitationAuthorSignature
        ),
        inviteeMainDeviceSigningPublicKey: safeMainDevice.signingPublicKey,
      },
    },
    { requestPolicy: "network-only" }
  );
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data) {
    // TODO: put up a toast explaining the new workspace
    const workspace = result.data.acceptWorkspaceInvitation?.workspace;
    if (!workspace) {
      // NOTE: probably the invitation expired or was deleted
      throw new Error("Could not find workspace");
    }
    return workspace;
  }
};
