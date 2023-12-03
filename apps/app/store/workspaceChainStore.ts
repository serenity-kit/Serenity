import * as workspaceChain from "@serenity-kit/workspace-chain";
import { generateId, notNull } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import { useSyncExternalStore } from "react";
import sodium from "react-native-libsodium";
import { runWorkspaceChainQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import * as workspaceStore from "./workspaceStore";

export const table = "workspace_chain_v1";

export const initialize = () => {
  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "workspaceId"	TEXT NOT NULL,
      "hash"	TEXT NOT NULL,
      PRIMARY KEY("position","workspaceId")
      FOREIGN KEY("workspaceId") REFERENCES "${workspaceStore.table}" ON DELETE CASCADE
    );`
  );
};

const getLastWorkspaceChainListeners: { [id: string]: () => void } = {};
export const triggerGetLastWorkspaceChain = () => {
  Object.values(getLastWorkspaceChainListeners).forEach((listener) =>
    listener()
  );
};

let getLastWorkspaceChainEventCache: {
  [workspaceId: string]: {
    position: number;
    event: workspaceChain.WorkspaceChainEvent;
    state: workspaceChain.WorkspaceChainState;
  };
} = {};
export const getLastWorkspaceChainEvent = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  // TODO create helper to get one
  const workspaceChainEventResult = sql.execute(
    `SELECT * FROM ${table} WHERE workspaceId = ? ORDER BY position DESC LIMIT 1`,
    [workspaceId]
  ) as any;
  const workspaceChainEvent =
    workspaceChainEventResult.length > 0
      ? {
          position: workspaceChainEventResult[0].position,
          event: JSON.parse(workspaceChainEventResult[0].content),
          state: JSON.parse(workspaceChainEventResult[0].state),
        }
      : undefined;

  // write a helper to canonicalize the input params and create a cache based on them
  if (
    workspaceChainEvent &&
    canonicalize(workspaceChainEvent) !==
      canonicalize(getLastWorkspaceChainEventCache[workspaceId])
  ) {
    getLastWorkspaceChainEventCache[workspaceId] = workspaceChainEvent;
  }
  return getLastWorkspaceChainEventCache[workspaceId];
};

export const getWorkspaceChainEventByHash = ({
  workspaceId,
  hash,
}: {
  workspaceId: string;
  hash: string;
}) => {
  // TODO create helper to get one
  const workspaceChainEventResult = sql.execute(
    `SELECT * FROM ${table} WHERE workspaceId = ? AND hash  = ? LIMIT 1`,
    [workspaceId, hash]
  ) as any;
  const workspaceChainEvent =
    workspaceChainEventResult.length > 0
      ? {
          position: workspaceChainEventResult[0].position,
          event: JSON.parse(workspaceChainEventResult[0].content),
          state: JSON.parse(workspaceChainEventResult[0].state),
        }
      : undefined;
  return workspaceChainEvent;
};

export const createWorkspaceChainEvent = ({
  workspaceId,
  event,
  state,
  position,
  triggerRerender,
}: {
  workspaceId: string;
  event: workspaceChain.WorkspaceChainEvent;
  state: workspaceChain.WorkspaceChainState;
  position: number;
  triggerRerender?: boolean;
}) => {
  sql.execute(`INSERT OR IGNORE INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
    position,
    JSON.stringify(event),
    JSON.stringify(state),
    workspaceId,
    workspaceChain.hashTransaction(event.transaction),
  ]);
  if (triggerRerender !== false) {
    triggerGetLastWorkspaceChain();
  }
};

export const useLocalLastWorkspaceChainEvent = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const result = useSyncExternalStore(
    (onStoreChange) => {
      const id = generateId();
      getLastWorkspaceChainListeners[id] = onStoreChange;
      return () => {
        delete getLastWorkspaceChainListeners[id];
      };
    },
    () => getLastWorkspaceChainEvent({ workspaceId })
  );

  return result;
};

export const useWorkspacePermission = ({
  workspaceId,
  mainDeviceSigningPublicKey,
}: {
  workspaceId: string;
  mainDeviceSigningPublicKey: string;
}) => {
  const result = useLocalLastWorkspaceChainEvent({ workspaceId });
  if (!result) {
    return undefined;
  }
  const member = result.state.members[mainDeviceSigningPublicKey];
  return member?.role;
};

export const useCanEditWorkspace = ({
  workspaceId,
  mainDeviceSigningPublicKey,
}: {
  workspaceId: string;
  mainDeviceSigningPublicKey: string;
}) => {
  const result = useWorkspacePermission({
    workspaceId,
    mainDeviceSigningPublicKey,
  });
  return result === "EDITOR" || result === "ADMIN";
};

export const loadRemoteWorkspaceChain = async ({
  workspaceId,
  sessionKey,
}: {
  workspaceId: string;
  sessionKey?: string;
}) => {
  const lastEvent = getLastWorkspaceChainEvent({ workspaceId });

  const workspaceChainQueryResult = await runWorkspaceChainQuery(
    {
      workspaceId,
      after: lastEvent
        ? sodium.to_base64(
            lastEvent.position.toString(),
            1 // sodium.base64_variants.ORIGINAL
          )
        : undefined,
    },
    sessionKey
      ? { fetchOptions: { headers: { Authorization: sessionKey } } }
      : undefined
  );

  if (workspaceChainQueryResult.error) {
    showToast("Failed to load the workspace.", "error");
  }

  if (
    workspaceChainQueryResult.data?.workspaceChain?.nodes &&
    workspaceChainQueryResult.data?.workspaceChain?.nodes.length > 0
  ) {
    // refactor the following part to be available in the chain API
    const chain =
      workspaceChainQueryResult.data.workspaceChain.nodes.filter(notNull);

    let otherRawEvents = chain;
    let state: workspaceChain.WorkspaceChainState;

    if (lastEvent) {
      state = lastEvent.state;
    } else {
      const [firstRawEvent, ...rest] = chain;
      otherRawEvents = rest;
      const firstEvent = workspaceChain.CreateChainWorkspaceChainEvent.parse(
        JSON.parse(firstRawEvent.serializedContent)
      );
      state = workspaceChain.applyCreateChainEvent(firstEvent);
      createWorkspaceChainEvent({
        event: firstEvent,
        workspaceId,
        state,
        triggerRerender: false,
        position: firstRawEvent.position,
      });
    }

    otherRawEvents.map((rawEvent) => {
      const event = workspaceChain.UpdateChainWorkspaceChainEvent.parse(
        JSON.parse(rawEvent.serializedContent)
      );
      state = workspaceChain.applyEvent(state, event);
      createWorkspaceChainEvent({
        event,
        workspaceId,
        state,
        triggerRerender: false,
        position: rawEvent.position,
      });
    });
    triggerGetLastWorkspaceChain();
  }

  return getLastWorkspaceChainEvent({ workspaceId });
};
