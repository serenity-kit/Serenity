import sodium from "react-native-libsodium";
import { userChainDomainContext } from "./constants";
import { InvalidUserChainError, UnknownVersionUserChainError } from "./errors";
import {
  CreateUserChainEvent,
  DeviceInfo,
  UserChainEvent,
  UserChainState,
} from "./types";
import { hashEvent, hashTransaction } from "./utils";
import { verifyDevice } from "./verifyDevice";

type Params = {
  event: UserChainEvent;
  knownVersion: number;
};

export const applyCreateUserChainEvent = ({
  event: rawEvent,
  knownVersion,
}: Params): UserChainState => {
  const event = CreateUserChainEvent.parse(rawEvent);
  const transactionHash = hashTransaction(event.transaction);
  const eventHash = hashEvent(event);
  const isValidSignature = sodium.crypto_sign_verify_detached(
    sodium.from_base64(event.author.signature),
    userChainDomainContext + transactionHash,
    sodium.from_base64(event.author.publicKey)
  );
  if (!isValidSignature) {
    throw new InvalidUserChainError(`Invalid signature for user chain.`);
  }

  if (event.transaction.version > knownVersion) {
    throw new UnknownVersionUserChainError(
      `User chain contains events with a version that yet can't be handled. Expected ${knownVersion} or lower, but got ${event.transaction.version}.`,
      event.transaction.version,
      knownVersion
    );
  }

  verifyDevice({
    signingPublicKey: event.author.publicKey,
    encryptionPublicKey: event.transaction.encryptionPublicKey,
    encryptionPublicKeySignature:
      event.transaction.encryptionPublicKeySignature,
  });

  const devices: { [publicKey: string]: DeviceInfo } = {
    [event.author.publicKey]: {
      expiresAt: undefined,
      encryptionPublicKey: event.transaction.encryptionPublicKey,
    },
  };

  return {
    id: event.transaction.id,
    devices,
    removedDevices: {},
    email: event.transaction.email,
    mainDeviceSigningPublicKey: event.author.publicKey,
    mainDeviceEncryptionPublicKey: event.transaction.encryptionPublicKey,
    mainDeviceEncryptionPublicKeySignature:
      event.transaction.encryptionPublicKeySignature,
    eventHash,
    eventVersion: event.transaction.version,
  };
};
