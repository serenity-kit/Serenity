import { decryptDevice } from "@serenity-tools/common";
import { finishLogin, startLogin } from "@serenity-tools/opaque";
import { Platform } from "react-native";
import sodium from "react-native-libsodium";
import { UpdateAuthenticationFunction } from "../../context/AppContext";
import {
  MainDeviceDocument,
  MainDeviceQuery,
  runLogoutMutation,
  runMeQuery,
} from "../../generated/graphql";
import { setMainDevice } from "../device/mainDeviceMemoryStore";
import { removeLastUsedDocumentIdAndWorkspaceId } from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { LocalDeviceInclInfo } from "./createDeviceWithInfo";
import {
  isUserIdSameAsLastLogin,
  removeLastLogin,
  setLoggedInUserId,
} from "./lastLoginStore";

const removeLastUsedWorkspaceIdIfLoginChanged = async (userId?: string) => {
  if (!userId) {
    await removeLastUsedDocumentIdAndWorkspaceId();
    await removeLastLogin();
  } else {
    const isLoginSame = await isUserIdSameAsLastLogin(userId);
    if (!isLoginSame) {
      await removeLastUsedDocumentIdAndWorkspaceId();
      await setLoggedInUserId(userId);
    }
  }
};

const getDeviceType = (useExtendedLogin: boolean) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return "mobile";
  }
  if (Platform.OS === "web") {
    return useExtendedLogin ? "web" : "temporary-web";
  }
  throw new Error(`Unsupported platform: ${Platform.OS}`);
};

export type LoginParams = {
  username: string;
  password: string;
  startLoginMutation: any;
  finishLoginMutation: any;
  updateAuthentication: UpdateAuthenticationFunction;
  device: LocalDeviceInclInfo;
  useExtendedLogin: boolean;
};
export const login = async ({
  username,
  password,
  startLoginMutation,
  finishLoginMutation,
  updateAuthentication,
  device,
  useExtendedLogin,
}: LoginParams) => {
  const logoutResult = await runLogoutMutation({}, {});
  const remoteCleanupSuccessful = logoutResult.data?.logout?.success || false;
  if (!remoteCleanupSuccessful) {
    // todo: report to user
    console.error("Remote logout failed");
  }
  await updateAuthentication(null);
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

  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      result.sessionKey,
      sodium.from_base64(device.signingPrivateKey)
    )
  );

  const finishLoginResult = await finishLoginMutation({
    input: {
      loginId: startLoginResult.data.startLogin.loginId,
      message: result.response,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
      deviceInfo: device.info,
      sessionTokenSignature,
      deviceType: getDeviceType(useExtendedLogin),
    },
  });
  if (!finishLoginResult.data?.finishLogin) {
    throw new Error("Failed to finish login");
  }
  const authenticatedUrqlClient = await updateAuthentication({
    sessionKey: result.sessionKey,
    expiresAt: finishLoginResult.data.finishLogin.expiresAt,
  });
  const meResult = await runMeQuery({});
  if (meResult.error) {
    // TODO: handle this error in the UI
    throw new Error(meResult.error.message);
  }
  if (!meResult.data?.me) {
    // TODO: handle this error in the UI
    throw new Error("Could not query me. Probably not logged in");
  }
  const userId = meResult.data.me.username;
  // if the user has changed, remove the previous lastusedworkspaceId and lastUsedDocumentId
  await removeLastUsedWorkspaceIdIfLoginChanged(userId);
  return { result, urqlClient: authenticatedUrqlClient };
};

export type FetchMainDeviceParams = {
  exportKey: string;
};
export const fetchMainDevice = async ({ exportKey }: FetchMainDeviceParams) => {
  const mainDeviceResult = await getUrqlClient()
    .query<MainDeviceQuery>(MainDeviceDocument, undefined, {
      // better to be safe here and always refetch
      requestPolicy: "network-only",
    })
    .toPromise();
  if (mainDeviceResult.error) {
    throw new Error(mainDeviceResult.error.message);
  }
  if (!mainDeviceResult.data?.mainDevice) {
    throw new Error("Failed to fetch main device.");
  }
  const mainDevice = mainDeviceResult.data.mainDevice;
  const privateKeys = decryptDevice({
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
