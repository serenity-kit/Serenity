import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
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
  runStartLoginMutation,
} from "../../generated/graphql";
import { setMainDevice } from "../../store/mainDeviceMemoryStore";
import {
  getWorkspaceChainEventByHash,
  loadRemoteWorkspaceChain,
} from "../../store/workspaceChainStore";
import { getOpaqueServerPublicKey } from "../getOpaqueServerPublicKey/getOpaqueServerPublicKey";
import { createDeviceWithInfo } from "./createDeviceWithInfo";

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
  // ideally we would remove the device, but that requires access to the mainDevice
  // running the logoutMutation without the removeDevice user-chain event at least
  // removes the session on the server
  await runLogoutMutation({});
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

  if (result.serverStaticPublicKey !== getOpaqueServerPublicKey()) {
    throw new Error("Failed to login. Please contact our support.");
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

  let webDeviceKey: string | undefined = undefined;
  let webDeviceCiphertext: string | undefined = undefined;
  let webDeviceNonce: string | undefined = undefined;

  if (deviceType === "web" || deviceType === "temporary-web") {
    webDeviceKey = sodium.to_base64(sodium.crypto_secretbox_keygen());
    webDeviceNonce = sodium.to_base64(
      sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    );
    webDeviceCiphertext = sodium.to_base64(
      sodium.crypto_secretbox_easy(
        JSON.stringify(device),
        sodium.from_base64(webDeviceNonce),
        sodium.from_base64(webDeviceKey)
      )
    );
  }

  const addDeviceEvent = userChain.addDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPrivateKey: device.signingPrivateKey,
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
    prevEvent: lastUserChainEvent,
    expiresAt,
  });
  const newUserChainState = userChain.applyEvent({
    state: userChainState.currentState,
    event: addDeviceEvent,
    knownVersion: userChain.version,
  });

  const sessionTokenSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      "login_session_key" + result.sessionKey,
      sodium.from_base64(device.signingPrivateKey)
    )
  );

  const newWorkspaceMemberDevicesProofs: {
    workspaceId: string;
    serializedWorkspaceMemberDevicesProof: string;
  }[] = [];
  for (const entry of finishLoginResult.data.finishLogin
    .workspaceMemberDevicesProofs) {
    const data =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
        JSON.parse(entry.serializedData)
      );

    // load latest workspace chain entries and check if the workspace chain event is included
    // to verify that the server is providing this or a newer workspace chain
    const { state } = await loadRemoteWorkspaceChain({
      workspaceId: entry.workspaceId,
      sessionKey: result.sessionKey,
    });
    const workspaceChainEvent = getWorkspaceChainEventByHash({
      hash: data.workspaceChainHash,
      workspaceId: entry.workspaceId,
    });
    if (!workspaceChainEvent) {
      throw new Error(
        "Workspace chain event not found in the current workspace chain"
      );
    }

    // TODO validate entry.authorMainDeviceSigningPublicKey is part of the workspace chain

    const isValid =
      workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
        authorPublicKey: entry.authorMainDeviceSigningPublicKey,
        workspaceMemberDevicesProof: entry.proof,
        workspaceMemberDevicesProofData: data,
      });
    if (!isValid) {
      throw new Error("Invalid workspace member devices proof");
    }

    const newProof =
      workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
        authorKeyPair: {
          privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
          publicKey: sodium.from_base64(mainDevice.signingPublicKey),
          keyType: "ed25519",
        },
        workspaceMemberDevicesProofData: {
          clock: data.clock + 1,
          userChainHashes: {
            ...data.userChainHashes,
            [newUserChainState.id]: newUserChainState.eventHash,
          },
          workspaceChainHash: state.lastEventHash,
        },
      });
    newWorkspaceMemberDevicesProofs.push({
      workspaceId: entry.workspaceId,
      serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
    });
  }

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
        workspaceMemberDevicesProofs: newWorkspaceMemberDevicesProofs,
        webDeviceCiphertext,
        webDeviceNonce,
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

  setMainDevice(mainDevice); // so it's locally available

  return {
    result,
    urqlClient: authenticatedUrqlClient,
    mainDevice,
    device,
    webDeviceKey,
    webDeviceAccessToken: addDeviceResult.data.addDevice.webDeviceAccessToken,
    userChainState: newUserChainState,
  };
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
