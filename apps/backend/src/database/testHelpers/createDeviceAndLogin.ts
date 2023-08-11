import { client, server } from "@serenity-kit/opaque";
import * as userChain from "@serenity-kit/user-chain";
import { LocalDevice, createDevice } from "@serenity-tools/common";
import { addHours } from "../../utils/addHours/addHours";
import { createSessionAndDevice } from "../authentication/createSessionAndDevice";
import { prisma } from "../prisma";
import { getUserByUsername } from "../user/getUserByUsername";
import { getLastUserChainEventWithState } from "../userChain/getLastUserChainEventWithState";

type Params = {
  username: string;
  password: string;
  envelope: string;
  mainDevice: LocalDevice;
};

export const createDeviceAndLogin = async ({
  username,
  password,
  envelope,
  mainDevice,
}: Params) => {
  if (!process.env.OPAQUE_SERVER_SETUP) {
    throw new Error("OPAQUE_SERVER_SETUP is not set");
  }

  const clientLoginStartResult = client.startLogin({ password });
  const serverLoginStartResult = server.startLogin({
    registrationRecord: envelope,
    startLoginRequest: clientLoginStartResult.startLoginRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
    userIdentifier: username,
  });
  const loginStartResponse = client.finishLogin({
    loginResponse: serverLoginStartResult.loginResponse,
    clientLoginState: clientLoginStartResult.clientLoginState,
    password,
  });

  if (!loginStartResponse) {
    throw new Error("Login failed");
  }

  const webDevice = createDevice();

  const user = await getUserByUsername({ username });
  const { lastUserChainEvent } = await getLastUserChainEventWithState({
    prisma,
    userId: user.id,
  });

  const expiresAt = addHours(new Date(), 1);
  const addDeviceEvent = userChain.addDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: webDevice.signingPublicKey,
    prevEvent: lastUserChainEvent.content,
    expiresAt,
  });

  const session = await createSessionAndDevice({
    username,
    sessionKey: loginStartResponse.sessionKey,
    device: {
      ...webDevice,
      info: JSON.stringify({
        type: "web",
        OS: "MacOS",
        OsVersion: null,
        Browser: "chrome",
        BrowserVersion: "100.0.1",
      }),
    },
    addDeviceEvent,
    deviceType: "web",
  });
  return {
    session,
    sessionKey: loginStartResponse.sessionKey,
    webDevice,
  };
};
