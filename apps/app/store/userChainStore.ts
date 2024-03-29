import * as userChain from "@serenity-kit/user-chain";
import { decryptMainDevice, notNull } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import {
  runFinishLoginMutation,
  runUserChainQuery,
  runWorkspaceMembersQuery,
} from "../generated/graphql";
import { getActiveDevice } from "../utils/device/getActiveDevice";
import { showToast } from "../utils/toast/showToast";
import { getCurrentUserInfo, setCurrentUserInfo } from "./currentUserInfoStore";
import * as sql from "./sql/sql";
import * as userStore from "./userStore";

export const table = "user_chain_v2";

export type UserChainEntry = {
  position: number;
  event: userChain.UserChainEvent;
  state: userChain.UserChainState;
};

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "userId"	TEXT NOT NULL,
      "hash"	TEXT NOT NULL,
      PRIMARY KEY("position","userId")
      FOREIGN KEY("userId") REFERENCES "${userStore.table}" ON DELETE CASCADE
    );`
  );
};

export const wipeCaches = () => {
  getLastUserChainEventCache = {};
};

export const createUserChainEvent = ({
  userId,
  event,
  state,
  position,
  triggerRerender,
}: {
  userId: string;
  event: userChain.UserChainEvent;
  state: userChain.UserChainState;
  position: number;
  triggerRerender?: boolean;
}) => {
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
    position,
    JSON.stringify(event),
    JSON.stringify(state),
    userId,
    state.eventHash,
  ]);
  // if (triggerRerender !== false) {
  //   triggerGetLastDocumentChain();
  // }
};

let getLastUserChainEventCache: {
  [workspaceId: string]: UserChainEntry;
} = {};
export const getLastUserChainEvent = ({ userId }: { userId: string }) => {
  // TODO create helper to get one
  const userChainEventResult = sql.execute(
    `SELECT * FROM ${table} WHERE userId = ? ORDER BY position DESC LIMIT 1`,
    [userId]
  ) as any;
  const userChainEvent =
    userChainEventResult.length > 0
      ? {
          position: userChainEventResult[0].position,
          event: JSON.parse(userChainEventResult[0].content),
          state: JSON.parse(userChainEventResult[0].state),
        }
      : undefined;

  // write a helper to canonicalize the input params and create a cache based on them
  if (
    userChainEvent &&
    canonicalize(userChainEvent) !==
      canonicalize(getLastUserChainEventCache[userId])
  ) {
    getLastUserChainEventCache[userId] = userChainEvent;
  }
  return getLastUserChainEventCache[userId];
};

export const getUserChainEntryByHash = ({
  userId,
  hash,
}: {
  userId: string;
  hash: string;
}) => {
  const userChainRawEntry = sql.execute(
    `SELECT * FROM ${table} WHERE userId = ? AND hash = ? LIMIT 1`,
    [userId, hash]
  ) as any;
  // TODO create helper to get one
  const userChainEntry =
    userChainRawEntry.length > 0
      ? ({
          position: userChainRawEntry[0].position,
          event: JSON.parse(userChainRawEntry[0].content),
          state: JSON.parse(userChainRawEntry[0].state),
        } as UserChainEntry)
      : undefined;

  return userChainEntry;
};

export const loadRemoteUserChainsForWorkspace = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const workspaceMembersQueryResult = await runWorkspaceMembersQuery({
    workspaceId,
  });
  // TODO instead of relying on this query result we should first fetch the latest workspace chain event
  // and then compare of this query returns all the users that are in the workspace chain
  if (workspaceMembersQueryResult.data?.workspaceMembers?.nodes) {
    const member =
      workspaceMembersQueryResult.data.workspaceMembers.nodes.filter(notNull);

    member.forEach((member) => {
      const lastEvent = getLastUserChainEvent({ userId: member.user.id });

      let chain = member.user.chain.filter(notNull);
      let otherRawEvents = chain;
      let state: userChain.UserChainState;

      if (lastEvent) {
        state = lastEvent.state;
        chain = chain.filter(
          (rawEvent) => rawEvent.position > lastEvent.position
        );
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
          userId: member.user.id,
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
          userId: member.user.id,
          state,
          triggerRerender: false,
          position: rawEvent.position,
        });
      });

      userStore.createUser({
        id: state.id,
        username: state.email,
        mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
        devices: state.devices,
        removedDevices: state.removedDevices,
      });
    });
  }
};

export const loadRemoteCurrentUserWithFinishLoginMutation = async ({
  loginId,
  finishLoginRequest,
  exportKey,
}: {
  loginId: string;
  finishLoginRequest: string;
  exportKey: string;
}) => {
  const finishLoginResult = await runFinishLoginMutation({
    input: {
      loginId,
      message: finishLoginRequest,
    },
  });
  if (!finishLoginResult.data?.finishLogin) {
    throw new Error("Failed to finish login");
  }

  const mainDevice = decryptMainDevice({
    ciphertext: finishLoginResult.data.finishLogin.mainDevice.ciphertext,
    nonce: finishLoginResult.data.finishLogin.mainDevice.nonce,
    exportKey,
  });

  let chain = finishLoginResult.data.finishLogin.userChain;
  let otherRawEvents = chain;
  let state: userChain.UserChainState;

  const [firstRawEvent, ...rest] = chain;
  otherRawEvents = rest;
  const firstEvent = userChain.CreateUserChainEvent.parse(
    JSON.parse(firstRawEvent.serializedContent)
  );
  state = userChain.applyCreateUserChainEvent({
    event: firstEvent,
    knownVersion: userChain.version,
  });

  if (mainDevice.signingPublicKey !== state.mainDeviceSigningPublicKey) {
    throw new Error(
      "Invalid user chain. mainDeviceSigningPublicKeys do not match"
    );
  }

  createUserChainEvent({
    event: firstEvent,
    userId: state.id,
    state,
    triggerRerender: false,
    position: firstRawEvent.position,
  });

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
      userId: state.id,
      state,
      triggerRerender: false,
      position: rawEvent.position,
    });
  });

  userStore.createUser({
    id: state.id,
    username: state.email,
    mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
    devices: state.devices,
    removedDevices: state.removedDevices,
  });

  setCurrentUserInfo({
    userId: state.id,
    mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
  });

  // TODO store workspaceMemberDevicesProofs in the workspaceMemberDevicesProofsStore

  const lastUserChainEvent = getLastUserChainEvent({ userId: state.id });
  return {
    workspaceMemberDevicesProofs:
      finishLoginResult.data.finishLogin.workspaceMemberDevicesProofs,
    lastUserChainEvent: lastUserChainEvent.event,
    currentUserChainState: state,
    mainDevice,
  };
};

// Here the latest user chain data from the server is fetched.
// To ensure the server doesn't sent a malicious user chain the following checks are done:
// 1. Check that the userId and mainDeviceSigningPublicKey match the chain results
// 2. Check that the current device is part of the chain (to avoid that the server sends an outdated chain for webDevices)
export const loadRemoteCurrentUser = async () => {
  const activeDevice = await getActiveDevice(true);
  if (!activeDevice) {
    throw new Error("Not logged in, device not found");
  }
  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) {
    throw new Error("Not logged in, currentUserInfo not found");
  }
  const lastEvent = getLastUserChainEvent({ userId: currentUserInfo.userId });
  const userChainQueryResult = await runUserChainQuery({});
  if (
    userChainQueryResult.error ||
    !userChainQueryResult.data?.userChain?.nodes
  ) {
    showToast("Failed to load latest user data.", "error");
    throw new Error("Failed to load latest user data.");
  }

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

    if (
      currentUserInfo.mainDeviceSigningPublicKey !==
      state.mainDeviceSigningPublicKey
    ) {
      throw new Error(
        "Invalid user chain. mainDeviceSigningPublicKeys do not match"
      );
    }
    if (currentUserInfo.userId !== state.id) {
      throw new Error("Invalid user chain. userId do not match");
    }

    createUserChainEvent({
      event: firstEvent,
      userId: state.id,
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
      userId: currentUserInfo.userId,
      state,
      triggerRerender: false,
      position: rawEvent.position,
    });
  });

  if (!state.devices[activeDevice.signingPublicKey]) {
    throw new Error("Invalid user chain. device not found");
  }

  userStore.createUser({
    id: state.id,
    username: state.email,
    mainDeviceSigningPublicKey: state.mainDeviceSigningPublicKey,
    devices: state.devices,
    removedDevices: state.removedDevices,
  });

  return getLastUserChainEvent({ userId: currentUserInfo.userId });
};
