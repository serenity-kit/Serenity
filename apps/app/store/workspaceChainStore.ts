import * as workspaceChain from "@serenity-kit/workspace-chain";
import { generateId, notNull } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import { useSyncExternalStore } from "react";
import { runWorkspaceChainQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import * as workspaceStore from "./workspaceStore";

export const table = "workspace_chain_v1";

export const initialize = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "position"	INTEGER NOT NULL,
      "content"	TEXT NOT NULL,
      "state"	TEXT NOT NULL,
      "workspaceId"	TEXT NOT NULL,
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

export const createWorkspaceChainEvent = ({
  workspaceId,
  event,
  state,
  triggerRerender,
}: {
  workspaceId: string;
  event: workspaceChain.WorkspaceChainEvent;
  state: workspaceChain.WorkspaceChainState;
  triggerRerender?: boolean;
}) => {
  const lastEvent = getLastWorkspaceChainEvent({ workspaceId });
  sql.execute(`INSERT INTO ${table} VALUES (?, ?, ?, ?);`, [
    lastEvent ? lastEvent.position + 1 : 0,
    JSON.stringify(event),
    JSON.stringify(state),
    workspaceId,
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

export const loadRemoteWorkspaceChain = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  // TODO only fetch the necessary workspace chain events (get the last one and pass it to the query)
  sql.execute(`DELETE FROM ${table};`);

  const workspaceChainQueryResult = await runWorkspaceChainQuery({
    workspaceId,
  });

  if (workspaceChainQueryResult.error) {
    showToast("Failed to load the workspace data.", "error");
  }

  if (
    workspaceChainQueryResult.data?.workspaceChain?.nodes &&
    workspaceChainQueryResult.data?.workspaceChain?.nodes.length > 0
  ) {
    // refactor the following part to be available in the chain API
    const chain =
      workspaceChainQueryResult.data.workspaceChain.nodes.filter(notNull);
    const [firstRawEvent, ...otherRawEvents] = chain;
    const firstEvent = workspaceChain.CreateChainWorkspaceChainEvent.parse(
      JSON.parse(firstRawEvent.serializedContent)
    );
    let state = workspaceChain.applyCreateChainEvent(firstEvent);
    createWorkspaceChainEvent({
      event: firstEvent,
      workspaceId,
      state,
      triggerRerender: false,
    });

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
      });
    });
    triggerGetLastWorkspaceChain();
  }
  return getLastWorkspaceChainEvent({ workspaceId });
};
