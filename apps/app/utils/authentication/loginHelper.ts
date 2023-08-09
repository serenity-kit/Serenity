import * as userChain from "@serenity-kit/user-chain";
import { decryptMainDevice } from "@serenity-tools/common";
import { addDays, addHours } from "date-fns";
import { Platform } from "react-native";
import sodium from "react-native-libsodium";
import { client } from "react-native-opaque";
import { UpdateAuthenticationFunction } from "../../context/AppContext";
import {
  runAddDeviceMutation,
  runFinishLoginMutation,
  runLogoutMutation,
  runMeQuery,
  runStartLoginMutation,
} from "../../generated/graphql";
import { setMainDevice } from "../device/mainDeviceMemoryStore";
import { removeLastUsedDocumentIdAndWorkspaceId } from "../lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { createDeviceWithInfo } from "./createDeviceWithInfo";
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

export const getDeviceType = (useExtendedLogin: boolean) => {
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
  updateAuthentication: UpdateAuthenticationFunction;
  useExtendedLogin: boolean;
};
export const login = async ({
  username,
  password,
  updateAuthentication,
  useExtendedLogin,
}: LoginParams) => {
  const logoutResult = await runLogoutMutation({}, {});
  const remoteCleanupSuccessful = logoutResult.data?.logout?.success || false;
  if (!remoteCleanupSuccessful) {
    // todo: report to user
    console.error("Remote logout failed");
  }
  await updateAuthentication(null);
  const clientLoginResult = client.startLogin({ password });
  const startLoginResult = await runStartLoginMutation({
    input: {
      username: username,
      challenge: clientLoginResult.startLoginRequest,
    },
  });
  // check for an error
  if (!startLoginResult.data?.startLogin) {
    console.error(startLoginResult.error);
    throw new Error("Failed to start login");
  }
  const result = client.finishLogin({
    password,
    loginResponse: startLoginResult.data.startLogin.challengeResponse,
    clientLoginState: clientLoginResult.clientLoginState,
  });
  if (!result) {
    throw new Error("Failed to finish login");
  }

  const finishLoginResult = await runFinishLoginMutation({
    input: {
      loginId: startLoginResult.data.startLogin.loginId,
      message: result.finishLoginRequest,
    },
  });
  if (!finishLoginResult.data?.finishLogin) {
    throw new Error("Failed to finish login");
  }

  const mainDevice = decryptMainDevice({
    ciphertext: finishLoginResult.data.finishLogin.mainDevice.ciphertext,
    nonce: finishLoginResult.data.finishLogin.mainDevice.nonce,
    exportKey: result.exportKey,
  });

  const userChainEvents = finishLoginResult.data.finishLogin.userChain.map(
    (userChainEvent) => JSON.parse(userChainEvent.serializedContent)
  );
  const userChainState = userChain.resolveState({
    events: userChainEvents,
    knownVersion: userChain.version,
  });
  if (
    mainDevice.signingPublicKey !==
    userChainState.currentState.mainDeviceSigningPublicKey
  ) {
    throw new Error("Invalid user chain");
  }
  const lastUserChainEvent = userChainEvents[userChainEvents.length - 1];

  const device = createDeviceWithInfo();
  if (!device.info) {
    throw new Error("Device Info is missing");
  }

  let expiresAt: Date | undefined;
  const deviceType = getDeviceType(useExtendedLogin);
  if (deviceType === "web") {
    expiresAt = addDays(new Date(), 30);
  } else if (deviceType === "temporary-web") {
    expiresAt = addHours(new Date(), 24);
  }

  const addDeviceEvent = userChain.addDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    devicePublicKey: device.signingPublicKey,
    prevEvent: lastUserChainEvent,
    expiresAt,
  });

  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      result.sessionKey,
      sodium.from_base64(device.signingPrivateKey)
    )
  );

  const addDeviceResult = await runAddDeviceMutation(
    {
      input: {
        loginId: startLoginResult.data.startLogin.loginId,
        deviceSigningPublicKey: device.signingPublicKey,
        deviceEncryptionPublicKey: device.encryptionPublicKey,
        deviceEncryptionPublicKeySignature: device.encryptionPublicKeySignature,
        deviceInfo: device.info,
        sessionTokenSignature,
        deviceType: getDeviceType(useExtendedLogin),
        serializedUserChainEvent: JSON.stringify(addDeviceEvent),
      },
    },
    {
      fetchOptions: { headers: { Authorization: result.sessionKey } },
    }
  );
  if (!addDeviceResult.data?.addDevice) {
    throw new Error("Failed to add device during login process");
  }

  const authenticatedUrqlClient = await updateAuthentication({
    sessionKey: result.sessionKey,
    expiresAt: addDeviceResult.data?.addDevice.expiresAt,
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

  setMainDevice(mainDevice); // so it's locally available

  return { result, urqlClient: authenticatedUrqlClient, mainDevice, device };
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
