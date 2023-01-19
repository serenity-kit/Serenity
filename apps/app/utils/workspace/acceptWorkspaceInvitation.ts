import sodium from "@serenity-tools/libsodium";
import canonicalize from "canonicalize";
import {
  runAcceptWorkspaceInvitationMutation,
  runMeQuery,
  Workspace,
} from "../../generated/graphql";
import { Device } from "../../types/Device";

export type Props = {
  workspaceInvitationId: string;
  mainDevice: Device;
  signingPrivateKey: string;
};

export const acceptWorkspaceInvitation = async ({
  workspaceInvitationId,
  mainDevice,
  signingPrivateKey,
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
    encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature!,
  };
  if (!safeMainDevice.encryptionPublicKeySignature) {
    safeMainDevice.encryptionPublicKeySignature = sodium.crypto_sign_detached(
      safeMainDevice.encryptionPublicKey,
      mainDevice.signingPrivateKey!
    );
  }
  const inviteeInfo = canonicalize({
    username: me.username,
    mainDevice: {
      signingPublicKey: safeMainDevice.signingPublicKey,
      encryptionPublicKey: safeMainDevice.encryptionPublicKey,
      encryptionPublicKeySignature: safeMainDevice.encryptionPublicKeySignature,
    },
  });
  const inviteeUsernameAndDeviceSignature = sodium.crypto_sign_detached(
    inviteeInfo!,
    signingPrivateKey
  );
  const result = await runAcceptWorkspaceInvitationMutation(
    {
      input: {
        workspaceInvitationId,
        inviteeUsername: me.username,
        inviteeMainDevice: safeMainDevice,
        inviteeUsernameAndDeviceSignature,
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
