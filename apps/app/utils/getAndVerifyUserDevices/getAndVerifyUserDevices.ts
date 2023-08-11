import * as userChain from "@serenity-kit/user-chain";
import { Device, verifyDevice } from "@serenity-tools/common";
import { runDevicesQuery, runUserChainQuery } from "../../generated/graphql";
import { notNull } from "../notNull/notNull";

export type VerifiedDevice = Device & {
  deviceName: string;
  expiresAt?: string;
  createdAt?: string;
  type: string;
};

type Params = {
  onlyNotExpired: boolean;
  first: number;
};

export const getAndVerifyUserDevices = async ({
  onlyNotExpired,
  first,
}: Params) => {
  const userChainQueryResult = await runUserChainQuery({});
  const devicesQueryResult = await runDevicesQuery({ onlyNotExpired, first });

  const devices =
    devicesQueryResult.data?.devices?.nodes?.filter(notNull) || [];

  let userChainState: userChain.UserChainState | null = null;
  let lastChainEvent: userChain.UserChainEvent | null = null;
  if (userChainQueryResult.data?.userChain?.nodes) {
    const userChainResult = userChain.resolveState({
      events: userChainQueryResult.data.userChain.nodes
        .filter(notNull)
        .map((event) => {
          const data = userChain.UserChainEvent.parse(
            JSON.parse(event.serializedContent)
          );
          lastChainEvent = data;
          return data;
        }),
      knownVersion: userChain.version,
    });
    userChainState = userChainResult.currentState;
  }

  const activeDevices: VerifiedDevice[] = [];
  const expiredDevices: VerifiedDevice[] = [];
  if (devices.length > 0 && userChainState !== null) {
    Object.entries(userChainState.devices).forEach(
      ([signingPublicKey, { expiresAt }]) => {
        const device = devices.find(
          (deviceInfo) => deviceInfo.signingPublicKey === signingPublicKey
        );
        if (!device) {
          return;
        }
        verifyDevice(device);

        const deviceInfo = JSON.parse(device.info || "{}");

        let deviceName = "";
        switch (deviceInfo.type) {
          case "web":
            deviceName = deviceInfo.browser;
            break;
          case "main":
            deviceName = "Main";
            break;
          default:
            deviceName = deviceInfo.os;
        }

        if (signingPublicKey === userChainState?.mainDeviceSigningPublicKey) {
          activeDevices.unshift({
            signingPublicKey,
            encryptionPublicKey: device.encryptionPublicKey,
            encryptionPublicKeySignature: device.encryptionPublicKeySignature,
            deviceName,
            expiresAt,
            createdAt: device?.createdAt,
            type: deviceInfo.type,
          });
        } else {
          if (
            expiresAt === undefined ||
            (expiresAt && new Date(expiresAt) > new Date())
          ) {
            activeDevices.push({
              signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              deviceName,
              expiresAt,
              createdAt: device?.createdAt,
              type: deviceInfo.type,
            });
          } else {
            expiredDevices.push({
              signingPublicKey,
              encryptionPublicKey: device.encryptionPublicKey,
              encryptionPublicKeySignature: device.encryptionPublicKeySignature,
              deviceName,
              expiresAt,
              createdAt: device?.createdAt,
              type: deviceInfo.type,
            });
          }
        }
      }
    );
  }
  return {
    devices: activeDevices,
    expiredDevices,
    lastChainEvent,
  };
};
