import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "../notNull/notNull";
import { VerifiedDevice } from "../types";

type SerializedUserChain = Array<{
  __typename?: "UserChainEvent";
  serializedContent: string;
  position?: number;
} | null>;

type Params = {
  serializedUserChain: SerializedUserChain;
};

export type VerifiedUserFromUserChain = {
  userId: string;
  email: string;
  mainDeviceSigningPublicKey: string;
  lastChainEvent: userChain.UserChainEvent;
  nonExpiredDevices: VerifiedDevice[];
  expiredDevices: VerifiedDevice[];
  userChainState: userChain.UserChainState;
};

export const constructUserFromSerializedUserChain = ({
  serializedUserChain,
}: Params): VerifiedUserFromUserChain => {
  if (serializedUserChain.length === 0) {
    throw new Error("Empty user-chains are not valid");
  }

  let userChainState: userChain.UserChainState;
  let lastChainEvent: userChain.UserChainEvent = {} as userChain.UserChainEvent;

  const userChainResult = userChain.resolveState({
    events: serializedUserChain.filter(notNull).map((event) => {
      const data = userChain.UserChainEvent.parse(
        JSON.parse(event.serializedContent)
      );
      lastChainEvent = data;
      return data;
    }),
    knownVersion: userChain.version,
  });
  userChainState = userChainResult.currentState;

  const nonExpiredDevices: VerifiedDevice[] = [];
  const expiredDevices: VerifiedDevice[] = [];
  Object.entries(userChainState.devices).forEach(
    ([signingPublicKey, { expiresAt, encryptionPublicKey }]) => {
      if (signingPublicKey === userChainState?.mainDeviceSigningPublicKey) {
        nonExpiredDevices.unshift({
          signingPublicKey,
          encryptionPublicKey,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });
      } else {
        if (
          expiresAt === undefined ||
          (expiresAt && new Date(expiresAt) > new Date())
        ) {
          nonExpiredDevices.push({
            signingPublicKey,
            encryptionPublicKey,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          });
        } else {
          expiredDevices.push({
            signingPublicKey,
            encryptionPublicKey,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          });
        }
      }
    }
  );
  const workspaceMember: VerifiedUserFromUserChain = {
    userId: userChainState.id,
    email: userChainState.email,
    mainDeviceSigningPublicKey: userChainState.mainDeviceSigningPublicKey,
    lastChainEvent,
    nonExpiredDevices,
    expiredDevices,
    userChainState,
  };
  return workspaceMember;
};
