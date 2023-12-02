import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "@serenity-tools/common";
import { runUserChainQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import { getCurrentUserInfo } from "./currentUserInfoStore";
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
      "mainDeviceSigningPublicKey"	TEXT NOT NULL UNIQUE,
      "devices"	TEXT NOT NULL,
      "removedDevices"	TEXT NOT NULL,
      PRIMARY KEY("id")
    );`
  );
};

export type User = {
  id: string;
  username: string;
  mainDeviceSigningPublicKey: string;
  devices: userChain.Devices;
  removedDevices: userChain.Devices;
};

// TODO this should probably overwrite the existing user
export const createUser = (params: User) => {
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
    params.id,
    params.username,
    params.mainDeviceSigningPublicKey,
    JSON.stringify(params.devices),
    JSON.stringify(params.removedDevices),
  ]);
};

const internalConvertUserResultToUser = (userResult: any) => {
  return {
    id: userResult.id,
    username: userResult.username,
    mainDeviceSigningPublicKey: userResult.mainDeviceSigningPublicKey,
    devices: JSON.parse(userResult.devices),
    removedDevices: JSON.parse(userResult.removedDevices),
  } as User;
};

const internalGetSingleUser = (result: any[]) => {
  if (result.length === 0) return undefined;
  return internalConvertUserResultToUser(result[0]);
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
  const removedUserResult = includeRemoved
    ? sql.execute(`SELECT * FROM ${table} WHERE removedDevices like ?`, [
        `%${signingPublicKey}%`,
      ])
    : [];
  const removedUser = internalGetSingleUser(removedUserResult);
  if (removedUser) {
    const userChainEventResult = getLastUserChainEvent({
      userId: removedUser.id,
    });
    return {
      ...removedUser,
      mainDeviceSigningPublicKey:
        userChainEventResult.state.mainDeviceSigningPublicKey,
    };
  }

  const userResult = sql.execute(
    `SELECT * FROM ${table} WHERE devices like ?`,
    [`%${signingPublicKey}%`]
  );
  const user = internalGetSingleUser(userResult);
  if (!user) return undefined;

  const expiresAt = user.devices[signingPublicKey].expiresAt;
  if (
    includeExpired ||
    expiresAt === undefined ||
    new Date(expiresAt) > new Date()
  ) {
    const userChainEventResult = getLastUserChainEvent({
      userId: user.id,
    });
    return {
      ...user,
      mainDeviceSigningPublicKey:
        userChainEventResult.state.mainDeviceSigningPublicKey,
    };
  }
  return undefined;
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
    mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
    devices: state.devices,
    removedDevices: state.removedDevices,
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

export const getLocalUsersByIds = (userIds: string[]) => {
  const result = sql.execute(
    `SELECT * FROM ${table} WHERE id IN (${userIds.map(() => "?").join(",")})`,
    userIds
  );
  return result.map(internalConvertUserResultToUser);
};

let getLocalCurrentUserCache: User | undefined;
export const getLocalCurrentUser = () => {
  if (getLocalCurrentUserCache) return getLocalCurrentUserCache;
  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) return undefined;
  const result = sql.execute(`SELECT * FROM ${table} WHERE id = ?`, [
    currentUserInfo.userId,
  ]);
  const user = internalGetSingleUser(result);
  getLocalCurrentUserCache = user;
  return user;
};

export const useGetLocalCurrentUser = () => {
  return getLocalCurrentUser();
};
