import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "@serenity-tools/common";
import { runUserChainQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import {
  createUserChainEvent,
  getLastUserChainEvent,
  getUserChainEntryByHash,
} from "./userChainStore";

export const table = "user_v1";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "id"	TEXT NOT NULL,
      "username"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

type User = {
  id: string;
  username: string;
};

export const createUser = (params: User) => {
  // id and username can not change so we can use INSERT OR IGNORE
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?);`, [
    params.id,
    params.username,
  ]);
};

export const getLocalUserByDeviceSigningPublicKey = ({
  signingPublicKey,
  includeExpired,
  includeRemoved,
}: {
  signingPublicKey: string;
  includeExpired?: boolean;
  includeRemoved?: boolean;
}) => {
  const users = sql.execute(`SELECT * FROM ${table}`) as User[];

  const user = users.find((user) => {
    const userChainEventResult = getLastUserChainEvent({ userId: user.id });
    if (!userChainEventResult) return false;

    const devices = userChainEventResult.state.devices;
    if (devices[signingPublicKey]) {
      if (includeExpired) {
        return true;
      }

      const expiresAt = devices[signingPublicKey].expiresAt;
      if (expiresAt === undefined) {
        return true;
      } else if (new Date(expiresAt) > new Date()) {
        return true;
      } else {
        return false;
      }
    }

    const removedDevices = userChainEventResult.state.removedDevices;
    if (includeRemoved && removedDevices[signingPublicKey]) {
      return true;
    }
    return false;
  });

  if (!user) return undefined;

  const userChainEventResult = getLastUserChainEvent({ userId: user.id });
  return {
    ...user,
    mainDeviceSigningPublicKey:
      userChainEventResult.state.mainDeviceSigningPublicKey,
    devices: userChainEventResult.state.devices,
    removedDevices: userChainEventResult.state.removedDevices,
  };
};

export const getLocalOrLoadRemoteUserByUserChainHash = async ({
  userChainHash,
  userId,
  workspaceId,
}: {
  userChainHash: string;
  userId: string;
  workspaceId: string;
}) => {
  const entry = getUserChainEntryByHash({ userId, hash: userChainHash });
  if (entry) {
    return {
      mainDeviceSigningPublicKey: entry.state.mainDeviceSigningPublicKey,
      devices: entry.state.devices,
      removedDevices: entry.state.removedDevices,
    };
  }

  const userChainQueryResult = await runUserChainQuery({ userId, workspaceId });

  if (userChainQueryResult.error) {
    showToast("Failed to load the data (workspace member).", "error");
  }

  if (!userChainQueryResult.data?.userChain?.nodes) {
    return undefined;
  }

  const lastEvent = getLastUserChainEvent({ userId });

  let chain = userChainQueryResult.data.userChain.nodes.filter(notNull);
  let otherRawEvents = chain;
  let state: userChain.UserChainState;

  if (lastEvent) {
    state = lastEvent.state;
    chain = chain.filter((rawEvent) => rawEvent.position > lastEvent.position);
    otherRawEvents = chain;
  } else {
    const [firstRawEvent, ...rest] = chain;
    otherRawEvents = rest;
    const firstEvent = userChain.CreateUserChainEvent.parse(
      JSON.parse(firstRawEvent.serializedContent)
    );
    state = userChain.applyCreateUserChainEvent({
      event: firstEvent,
      knownVersion: userChain.version,
    });
    createUserChainEvent({
      event: firstEvent,
      userId,
      state,
      triggerRerender: false,
      position: firstRawEvent.position,
    });
  }

  otherRawEvents.map((rawEvent) => {
    const event = userChain.UpdateChainEvent.parse(
      JSON.parse(rawEvent.serializedContent)
    );
    state = userChain.applyEvent({
      state,
      event,
      knownVersion: userChain.version,
    });
    createUserChainEvent({
      event,
      userId,
      state,
      triggerRerender: false,
      position: rawEvent.position,
    });
  });

  createUser({
    id: state.id,
    username: state.email,
  });

  const entry2 = getUserChainEntryByHash({ userId, hash: userChainHash });
  if (entry2) {
    return {
      mainDeviceSigningPublicKey: entry2.state.mainDeviceSigningPublicKey,
      devices: entry2.state.devices,
      removedDevices: entry2.state.removedDevices,
    };
  }
};
