import { MainDeviceQuery, MainDeviceDocument } from "../../generated/graphql";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { decryptDevice } from "@serenity-tools/common";
import { setMainDevice } from "../device/mainDeviceMemoryStore";
import { Client } from "urql";
import { UpdateAuthenticationFunction } from "../../context/AuthenticationContext";

export type LoginParams = {
  username: string;
  password: string;
  startLoginMutation: any;
  finishLoginMutation: any;
  updateAuthentication: UpdateAuthenticationFunction;
};
export const login = async ({
  username,
  password,
  startLoginMutation,
  finishLoginMutation,
  updateAuthentication,
}: LoginParams) => {
  const message = await startLogin(password);
  const startLoginResult = await startLoginMutation({
    input: {
      username: username,
      challenge: message,
    },
  });
  // check for an error
  if (!startLoginResult.data?.startLogin) {
    console.error(startLoginResult.error);
    throw new Error("Failed to start login");
  }
  const result = await finishLogin(
    startLoginResult.data.startLogin.challengeResponse
  );
  const finishLoginResult = await finishLoginMutation({
    input: {
      loginId: startLoginResult.data.startLogin.loginId,
      message: result.response,
    },
  });
  if (!finishLoginResult.data?.finishLogin) {
    throw new Error("Failed to finish login");
  }
  await updateAuthentication({
    sessionKey: result.sessionKey,
    expiresAt: finishLoginResult.data.finishLogin.expiresAt,
  });
  return result;
};

export type FetchMainDeviceParams = {
  urqlClient: Client;
  exportKey: string;
};
export const fetchMainDevice = async ({
  urqlClient,
  exportKey,
}: FetchMainDeviceParams) => {
  const mainDeviceResult = await urqlClient
    .query<MainDeviceQuery>(MainDeviceDocument, undefined, {
      // better to be safe here and always refetch
      requestPolicy: "network-only",
    })
    .toPromise();
  console.log({ mainDeviceResult });
  if (!mainDeviceResult.data?.mainDevice) {
    throw new Error("Failed to fetch main device.");
  }
  const mainDevice = mainDeviceResult.data.mainDevice;
  const privateKeys = await decryptDevice({
    ciphertext: mainDevice.ciphertext,
    encryptionKeySalt: mainDevice.encryptionKeySalt,
    nonce: mainDevice.nonce,
    exportKey,
  });
  setMainDevice({
    encryptionPrivateKey: privateKeys.encryptionPrivateKey,
    signingPrivateKey: privateKeys.signingPrivateKey,
    signingPublicKey: mainDevice.signingPublicKey,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
  });
};

/**
 * This function is designed to handle post-login routing logic
 * The reason is that maybe a user clicks a link to a document
 * but then isn't logged in, so they have to pass through the login
 * screen, then get forwarded by the login screen to the document.
 *
 * This function will abstract that use case.
 *
 * @param navigation
 */
export type NavigateToNextAuthenticatedPageProps = {
  navigation: any;
  pendingWorkspaceInvitationId: string | null | undefined;
};
export const navigateToNextAuthenticatedPage = ({
  navigation,
  pendingWorkspaceInvitationId,
}: NavigateToNextAuthenticatedPageProps) => {
  if (pendingWorkspaceInvitationId) {
    navigation.navigate("AcceptWorkspaceInvitation", {
      workspaceInvitationId: pendingWorkspaceInvitationId,
    });
  } else {
    navigation.navigate("Root");
  }
};
