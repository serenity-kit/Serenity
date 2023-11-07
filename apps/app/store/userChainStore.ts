import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "@serenity-tools/common";
import canonicalize from "canonicalize";
import { runWorkspaceMembersQuery } from "../generated/graphql";
import * as sql from "./sql/sql";
import * as userStore from "./userStore";

export const table = "user_chain_v1";

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
  sql.execute(`INSERT INTO ${table} VALUES (?, ?, ?, ?, ?);`, [
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
  [workspaceId: string]: {
    position: number;
    event: userChain.UserChainEvent;
    state: userChain.UserChainState;
  };
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

export const loadRemoteUserChainsForWorkspace = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const workspaceMembersQueryResult = await runWorkspaceMembersQuery({
    workspaceId,
  });
  if (workspaceMembersQueryResult.data?.workspaceMembers?.nodes) {
    const member =
      workspaceMembersQueryResult.data.workspaceMembers.nodes.filter(notNull);

    member.forEach((member) => {
      userStore.createUser({
        id: member.user.id,
        username: member.user.username,
      });

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
    });
  }
};
