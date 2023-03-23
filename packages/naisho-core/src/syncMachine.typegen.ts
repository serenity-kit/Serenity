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
    "done.invoke.sheduleRetry": {
      type: "done.invoke.sheduleRetry";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.processQueues": {
      type: "error.platform.processQueues";
      data: unknown;
    };
    "error.platform.sheduleRetry": {
      type: "error.platform.sheduleRetry";
      data: unknown;
    };
    "xstate.after(0)#syncMachine.connected.checkingForMoreQueueItems": {
      type: "xstate.after(0)#syncMachine.connected.checkingForMoreQueueItems";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    processQueues: "done.invoke.processQueues";
    sheduleRetry: "done.invoke.sheduleRetry";
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
    increaseWebsocketRetry: "WEBSOCKET_RETRY";
    removeOldestItemFromQueueAndUpdateContext: "done.invoke.processQueues";
    resetWebsocketRetries: "WEBSOCKET_CONNECTED";
    spawnWebsocketActor: "WEBSOCKET_RETRY";
    stopWebsocketActor: "DISCONNECT" | "WEBSOCKET_DISCONNECTED";
    updateShouldReconnect: "DISCONNECT" | "WEBSOCKET_DISCONNECTED";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasMoreItemsInQueues: "xstate.after(0)#syncMachine.connected.checkingForMoreQueueItems";
    shouldReconnect: "";
  };
  eventsCausingServices: {
    processQueues:
      | "ADD_CHANGE"
      | "WEBSOCKET_ADD_TO_QUEUE"
      | "xstate.after(0)#syncMachine.connected.checkingForMoreQueueItems";
    sheduleRetry: "" | "DISCONNECT" | "WEBSOCKET_DISCONNECTED" | "xstate.init";
  };
  matchesStates:
    | "connected"
    | "connected.checkingForMoreQueueItems"
    | "connected.idle"
    | "connected.processingQueues"
    | "connecting"
    | "connecting.retrying"
    | "connecting.waiting"
    | "disconnected"
    | "failed"
    | "final"
    | {
        connected?: "checkingForMoreQueueItems" | "idle" | "processingQueues";
        connecting?: "retrying" | "waiting";
      };
  tags: never;
}
