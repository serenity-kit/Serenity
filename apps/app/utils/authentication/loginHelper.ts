import { MainDeviceQuery, MainDeviceDocument } from "../../generated/graphql";
import { startLogin, finishLogin } from "@serenity-tools/opaque";
import { decryptDevice } from "@serenity-tools/common";
import { setMainDevice } from "../device/mainDeviceMemoryStore";
import { Client } from "urql";
import { UpdateAuthenticationFunction } from "../../context/AuthenticationContext";
import { createAndSetDevice } from "../device/deviceStore";
import { Platform } from "react-native";
import { detect } from "detect-browser";
import {
  isUsernameSameAsLastLogin,
  setLoggedInUsername,
} from "./lastLoginStore";
import { removeLastUsedDocumentIdAndWorkspaceId } from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
const browser = detect();

const removeLastUsedWorkspaceIdIfLoginChanged = async (username: string) => {
  const isLoginSame = await isUsernameSameAsLastLogin(username);
  if (!isLoginSame) {
    await removeLastUsedDocumentIdAndWorkspaceId();
    await setLoggedInUsername(username);
  }
};

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
  const finishLoginResult = await finishLoginMutation({
    input: {
      loginId: startLoginResult.data.startLogin.loginId,
      message: result.response,
    },
  });
  if (!finishLoginResult.data?.finishLogin) {
    throw new Error("Failed to finish login");
  }
  // if the user has changed, remove the previous lastusedworkspaceId and lastUsedDocumentId
  await removeLastUsedWorkspaceIdIfLoginChanged(username);
  await updateAuthentication({
    sessionKey: result.sessionKey,
    expiresAt: finishLoginResult.data.finishLogin.expiresAt,
  });
  console.log("Logging in...");
  console.log({ result });
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
  console.log("main device private keys:");
  console.log({ privateKeys });
  setMainDevice({
    encryptionPrivateKey: privateKeys.encryptionPrivateKey,
    signingPrivateKey: privateKeys.signingPrivateKey,
    signingPublicKey: mainDevice.signingPublicKey,
    encryptionPublicKey: mainDevice.encryptionPublicKey,
  });
};

/**
 * This method creates a new device, stores it in secure storage,
 * creates the JSON device info, and prepares it for registering
 * with graphql.
 *
 * @returns the device information including signing and encryption private keys
 *          and stringified JSON device info
 */
export const createRegisterAndStoreDevice = async (): Promise<any> => {
  let type = "device";
  if (Platform.OS === "web") {
    type = "web";
  }
  const deviceData = await createAndSetDevice();
  if (deviceData) {
    const { signingPrivateKey, encryptionPrivateKey, ...platformDevice } =
      deviceData;
    const deviceInfoJson = {
      type,
      os: Platform.OS,
      osVersion: Platform.Version,
      browser: null,
      browserVersion: null,
    };
    const deviceInfo = JSON.stringify(deviceInfoJson);
    const newDeviceInfo = {
      ...platformDevice,
      info: deviceInfo,
    };
    return newDeviceInfo;
  }
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
