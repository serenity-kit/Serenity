// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "": { type: "" };
    "done.invoke.processQueues": {
      type: "done.invoke.processQueues";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.processQueues": {
      type: "error.platform.processQueues";
      data: unknown;
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    processQueues: "done.invoke.processQueues";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    addToIncomingQueue: "WEBSOCKET_ADD_TO_QUEUE";
    addToPendingUpdatesQueue: "ADD_CHANGE";
    removeOldestItemFromQueueAndUpdateContext: "done.invoke.processQueues";
    spawnWebsocketActor: "xstate.init";
    stopWebsocketActor: "DISCONNECT" | "WEBSOCKET_DISCONNECTED";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasMoreItemsInQueues: "";
  };
  eventsCausingServices: {
    processQueues: "" | "ADD_CHANGE" | "WEBSOCKET_ADD_TO_QUEUE";
  };
  matchesStates:
    | "connected"
    | "connected.checkingForMoreQueueItems"
    | "connected.idle"
    | "connected.processingQueues"
    | "connecting"
    | "disconnected"
    | "failed"
    | "final"
    | { connected?: "checkingForMoreQueueItems" | "idle" | "processingQueues" };
  tags: never;
}
