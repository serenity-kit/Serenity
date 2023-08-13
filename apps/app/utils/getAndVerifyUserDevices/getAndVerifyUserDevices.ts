import * as userChain from "@serenity-kit/user-chain";
import { VerifiedDevice } from "@serenity-tools/common";
import { runUserChainQuery } from "../../generated/graphql";
import { notNull } from "../notNull/notNull";

export const getAndVerifyUserDevices = async () => {
  const userChainQueryResult = await runUserChainQuery({});

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

  const nonExpiredDevices: VerifiedDevice[] = [];
  const expiredDevices: VerifiedDevice[] = [];
  if (userChainState !== null) {
    Object.entries(userChainState.devices).forEach(
      ([signingPublicKey, { expiresAt, encryptionPublicKey }]) => {
        if (signingPublicKey === userChainState?.mainDeviceSigningPublicKey) {
          nonExpiredDevices.unshift({
            signingPublicKey,
            encryptionPublicKey,
          });
        } else {
          if (
            expiresAt === undefined ||
            (expiresAt && new Date(expiresAt) > new Date())
          ) {
            nonExpiredDevices.push({
              signingPublicKey,
              encryptionPublicKey,
            });
          } else {
            expiredDevices.push({
              signingPublicKey,
              encryptionPublicKey,
            });
          }
        }
      }
    );
  }
  return {
    nonExpiredDevices,
    expiredDevices,
    lastChainEvent,
  };
};
