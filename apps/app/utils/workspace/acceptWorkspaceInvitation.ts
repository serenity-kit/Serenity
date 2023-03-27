import { LocalDevice } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  runAcceptWorkspaceInvitationMutation,
  runMeQuery,
  Workspace,
} from "../../generated/graphql";

export type Props = {
  workspaceInvitationId: string;
  mainDevice: LocalDevice;
  signingKeyPairSeed: string;
};

export const acceptWorkspaceInvitation = async ({
  workspaceInvitationId,
  mainDevice,
  signingKeyPairSeed,
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
  const inviteeInfo = canonicalize({
    username: me.username,
    mainDevice: {
      signingPublicKey: safeMainDevice.signingPublicKey,
      encryptionPublicKey: safeMainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: safeMainDevice.encryptionPublicKeySignature,
    },
  })!;
  const invitationSigningPrivateKey = sodium.crypto_sign_seed_keypair(
    sodium.from_base64(signingKeyPairSeed)
  ).privateKey;

  const inviteeUsernameAndDeviceSignature = sodium.crypto_sign_detached(
    inviteeInfo,
    invitationSigningPrivateKey
  );
  const result = await runAcceptWorkspaceInvitationMutation(
    {
      input: {
        workspaceInvitationId,
        inviteeUsername: me.username,
        inviteeMainDevice: safeMainDevice,
        inviteeUsernameAndDeviceSignature: sodium.to_base64(
          inviteeUsernameAndDeviceSignature
        ),
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
