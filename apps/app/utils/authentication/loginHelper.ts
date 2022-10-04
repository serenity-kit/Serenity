import { decryptDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { finishLogin, startLogin } from "@serenity-tools/opaque";
import { Platform } from "react-native";
import { Client } from "urql";
import { UpdateAuthenticationFunction } from "../../context/AppContext";
import {
  MainDeviceDocument,
  MainDeviceQuery,
  MeDocument,
  MeQuery,
  MeQueryVariables,
} from "../../generated/graphql";
import { setMainDevice } from "../device/mainDeviceMemoryStore";
import { removeLastUsedDocumentIdAndWorkspaceId } from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
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
  urqlClient: Client;
  useExtendedLogin: boolean;
};
export const login = async ({
  username,
  password,
  startLoginMutation,
  finishLoginMutation,
  updateAuthentication,
  device,
  urqlClient,
  useExtendedLogin,
}: LoginParams) => {
  console.log("--------- updateAuthentication: null -------------");
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

  const sessionTokenSignature = await sodium.crypto_sign_detached(
    result.sessionKey,
    device.signingPrivateKey
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
  console.log("--------- updateAuthentication: sessionKey -------------");
  console.log({ session: result });
  await updateAuthentication({
    sessionKey: result.sessionKey,
    expiresAt: finishLoginResult.data.finishLogin.expiresAt,
  });
  const meResult = await urqlClient
    .query<MeQuery, MeQueryVariables>(
      MeDocument,
      {},
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const userId = meResult.data?.me?.id;
  // if the user has changed, remove the previous lastusedworkspaceId and lastUsedDocumentId
  await removeLastUsedWorkspaceIdIfLoginChanged(userId);
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
  if (mainDeviceResult.error) {
    throw new Error(mainDeviceResult.error.message);
  }
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
