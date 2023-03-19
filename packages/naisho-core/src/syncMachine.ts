import type { KeyPair } from "libsodium-wrappers";
import {
  AnyActorRef,
  assign,
  createMachine,
  forwardTo,
  sendTo,
  spawn,
} from "xstate";
import { z } from "zod";
import {
  createEphemeralUpdate,
  verifyAndDecryptEphemeralUpdate,
} from "./ephemeralUpdate";
import { createSnapshot, verifyAndDecryptSnapshot } from "./snapshot";
import {
  SnapshotFailedEvent,
  SnapshotWithServerData,
  UpdateWithServerData,
} from "./types";
import { createUpdate, verifyAndDecryptUpdate } from "./update";

// The sync machine is responsible for syncing the document with the server.
// Specifically it is responsible for:
// - sending snapshots
// - sending updates
// - sending ephemeral updates
// - receiving snapshots
// - receiving updates
// - receiving ephemeral updates
//
// In general the first thing that happens is that a websocket connection is established.
// Once that's done the latest snapshot including it's related updates should be received.
//
// In order to process incoming and outgoing changes the sync machine uses two queues:
// - _incomingQueue: contains all incoming messages from the server
// - _pendingChangesQueue: contains all outgoing messages that are not yet sent to the server
//
// How Queue processing works
// -------------------------
// 1. first handle all incoming message
// 2. then handle all pending updates
// Background: There might be a new snapshot and this way we avoid retries
//
// Websockets reconnection logic:
// During the state connecting the sync machine will try to reconnect to the server.
// If no connection can be established after 5 seconds it will trigger a retry after a delay.
// The delay is based on the number of retries that have already been done using an exponential
// formula: (100 * 1.8 ** websocketRetries).
// The websocketRetries is capped at 13 so that the delay doesn't get too large.
//
// Handling outgoing messages
// -------------------------
// Once a change is added and the `_pendingChangesQueue` is processed it will collect all changes
// and depending on `shouldSendSnapshot` either send a snapshot or an update.
// In case a snapshot is sent `_pendingChangesQueue` is cleared and the `_activeSendingSnapshotId` set to the snapshot ID.
// In case an update is sent the changes will be added to the `_updatesInFlight` and the `_sendingUpdatesClock` increased by one.
//
// If a snapshot saved event is received
// - the `_activeSnapshotId` is set to the snapshot ID and
// - the `_activeSendingSnapshotId` is cleared.
// Queue processing for sending messages is resumed.
//
// If an update saved event is received
// - the `_latestServerVersion` is set to the update version
// - the `_confirmedUpdatesClock`
// - the update removed from the `_updatesInFlight` removed
//
// IF a snapshot failed to save
// - the snapshot and changes that came with the response are applied and another snapshot is created and sent
//
// If an update failed to save
// - check if the update is in the `_updatesInFlight` - only if it's there a retry is necessary
// since we know it was not handled by a new snapshot or update
// - set the `_sendingUpdatesClock` to the `_confirmedUpdatesClock`
// - all the changes from this failed and later updates plus the new pendingChanges are taken and a new update is created and
// sent with the clock set to the latest confirmed clock + 1
//
// When loading the initial document it's important to make sure these variables are correctly set:
// - `_confirmedUpdatesClock`
// - `_sendingUpdatesClock` (same as `_confirmedUpdatesClock`)
// - `_latestServerVersion`
// - `_activeSnapshotId`
// Otherwise you might try to send an update that the server will reject.

type UpdateInFlight = {
  clock: number;
  changes: any[];
};

type ProcessQueueData = {
  handledQueue: "incoming" | "pending" | "none";
  activeSnapshotId: string | null;
  latestServerVersion: number | null;
  activeSendingSnapshotId: string | null;
  sendingUpdatesClock: number;
  confirmedUpdatesClock: number;
  updatesInFlight: UpdateInFlight[];
  pendingChangesQueue: any[];
};

export type SyncMachineConfig = {
  documentId: string;
  signatureKeyPair: KeyPair;
  websocketHost: string;
  websocketSessionKey: string;
  applySnapshot: (decryptedSnapshot: any) => void;
  getSnapshotKey: (snapshot: any | undefined) => Promise<Uint8Array>;
  getNewSnapshotData: () => Promise<{
    readonly id: string;
    readonly data: Uint8Array | string;
    readonly key: Uint8Array;
    readonly publicData: any;
  }>;
  applyChanges: (updates: any[]) => void;
  getUpdateKey: (update: any) => Promise<Uint8Array>;
  applyEphemeralUpdates: (ephemeralUpdates: any[]) => void;
  getEphemeralUpdateKey: () => Promise<Uint8Array>;
  shouldSendSnapshot: (info: {
    activeSnapshotId: string | null;
    latestServerVersion: number | null;
  }) => boolean;
  serializeChanges: (changes: unknown[]) => string;
  deserializeChanges: (string) => unknown[];
  sodium: any;
  onDocumentLoaded?: () => void;
  onSnapshotSent?: () => void | Promise<void>;
};

export type Context = SyncMachineConfig & {
  _latestServerVersion: null | number;
  _activeSnapshotId: null | string;
  _websocketActor?: AnyActorRef;
  _incomingQueue: any[];
  _pendingChangesQueue: any[];
  _activeSendingSnapshotId: string | null;
  _shouldReconnect: boolean;
  _websocketRetries: number;
  _updatesInFlight: UpdateInFlight[];
  _confirmedUpdatesClock: number | null;
  _sendingUpdatesClock: number;
};

const websocketService = (context) => (send, onReceive) => {
  let connected = false;

  // timeout the connection try after 5 seconds
  setTimeout(() => {
    if (!connected) {
      send({ type: "WEBSOCKET_DISCONNECTED" });
    }
  }, 5000);

  const websocketConnection = new WebSocket(
    `${context.websocketHost}/${context.documentId}?sessionKey=${context.websocketSessionKey}`
  );

  const onWebsocketMessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "documentNotFound":
        // TODO stop reconnecting
        send({ type: "WEBSOCKET_DOCUMENT_NOT_FOUND" });
        break;
      case "unauthorized":
        // TODO stop reconnecting
        send({ type: "UNAUTHORIZED" });
        break;
      default:
        send({ type: "WEBSOCKET_ADD_TO_QUEUE", data });
    }
  };

  websocketConnection.addEventListener("message", onWebsocketMessage);

  websocketConnection.addEventListener("open", (event) => {
    connected = true;
    send({ type: "WEBSOCKET_CONNECTED", websocket: websocketConnection });
  });

  websocketConnection.addEventListener("error", (event) => {
    console.log("websocket error", event);
    send({ type: "WEBSOCKET_DISCONNECTED" });
  });

  websocketConnection.addEventListener("close", function (event) {
    console.log("websocket closed");
    send({ type: "WEBSOCKET_DISCONNECTED" });
    // remove the awareness states of everyone else
    // removeAwarenessStates(
    //   yAwarenessRef.current,
    //   Array.from(yAwarenessRef.current.getStates().keys()).filter(
    //     (client) => client !== yDocRef.current.clientID
    //   ),
    //   "TODOprovider"
    // );
  });

  onReceive((event) => {
    if (event.type === "SEND") {
      websocketConnection.send(event.message);
    }
    if (event.type === "SEND_EPHEMERAL_UPDATE") {
      const prepareAndSendEphemeralUpdate = async () => {
        const publicData = {
          docId: context.documentId,
          pubKey: context.sodium.to_base64(context.signatureKeyPair.publicKey),
        };
        const ephemeralUpdateKey = await event.getEphemeralUpdateKey();
        const ephemeralUpdate = createEphemeralUpdate(
          event.data,
          publicData,
          ephemeralUpdateKey,
          context.signatureKeyPair
        );
        console.log("send ephemeralUpdate");
        send({ type: "SEND", message: JSON.stringify(ephemeralUpdate) });
      };

      try {
        prepareAndSendEphemeralUpdate();
      } catch (error) {
        // TODO send a error event to the parent
        console.error(error);
      }
    }
  });

  return () => {
    // TODO remove event listeners? is this necessary?
    console.log("CLOSE WEBSOCKET");
    websocketConnection.close();
  };
};

export const syncMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwJ4DsDGBZAhhgFgJZpgDEAygKIByAIgNoAMAuoqAA4D2shALoZzRsQAD0QBORuIB0AdgAs8gIyyATEtUBmAKwAOedoA0IFIg0Bfc8dSZcBYmQCCtWgH1KABQASlLJQBKjgAyrgCqHrSOACqUTKxIIFw8-ILCpggAtCry0uKySjpKAGxa2oVFxmIIqoyq2tKaRfJFStpFukUtZZbW6Nh4RCTSGIIkGPxoUKQA6pQAQuQA8gDCANKUUa7Li9TUlMsxDCzCSXwCQglVmko5es2NRTqaqrLG6TX1eprP2kqMZbIiuIeiAbP17EMRmgxrxIDN5ks1htXLQAJLkba7faHOInbhnVKXMzfGSyWSaeTkinPJQaN6IWTaWS5fTXeQU1oFeQgsF2QZgYajMDjOGzBYrdabWgrUJ+aibaiLTYAMUWoTouISpxSF1AVQKmlJ5Mp33Z6jpJgkmkY0hUSl0rVUJV0FNkPL6fIcguhwthEHh4qRm3VjlCUS8i38qIAWpQjvEOPidcJ9SS5MaqWbaap6Qh9DlGLJdP8amS8rp3bYBl6oTDRQiJcj1gBNVxYaIBVHBTWJ5LnFOIPQyB1MoHWjo6XPabQ2kuMXRlAzsoGV8H8711-1ojE7PYHHuJJP9okIDQaaRSWS1eSMZRtF65yk5cSGsqde2qAxFbSrz2QoUihA0iEBAAA2ZBioikquM4bhRIsrgAIqhJQKEHtqx56mY37SN+ugLvamgurI4gWukpEyJIugkS62jLlIv7Vv+PqAcBYFOC4WxeI41AAOKxMcWpHoSWHVDheEESUTy-BUlp5vkuTzjROj0cCVigh6TECrWvqQNI7AAE6cBgcA8JMiEAK5gFZsCkBAggCsQABunAANYCoZxmmZZ1lwOhwm6qIDIutIvy3taeTzkuubiOo0g3uIihAsW4jtEUjEQtpAF+vpRkmbAZlQD5NmkGABlGQZ+mgTgvAAGacAZAC2uVeQVxV+YJvYEoFVQyRe8iqOIuiqCNigvLouYdMyWi3qoDolJSuhqb0VaZRuulAZ5+WFe1tmQY2mywa48FIShaGdYefYiUFCCUsyUVNDct4tFouZkkotpzfojJNNJGXrjprFbaZxBFVZJVHcs3F8QJCaXd1A55g6uTKIaQKtB0-yTeS8VSElQ1SGl-01tlekEMKrmg8qDVYA1YDtaisKNXtDZBjBnEnchqGw3iV09WYjDPLkM5tKRV7KIlk3yDIjQ3M0eSJQoxPMZuwz4BTVM03TDNM7ZkPQ-x-l82kEjiJR046NOTJ6A6lRmMouhyK0eE3u0OhuupvJaetrHkxglOTNTBm0wZ9Pg2AjNgMzpBGwjJ5-G08XNO07JFowhG5tmqjSB0M5DQYWhKHkytZSxOV+wHUBByHYe+ZH0f0EocMYdd+r-EUSedKyacZ3JGiMB3+jiNog2KP8Fae5pa0QIQsCA36McXS3-OnkUgs548RRFiUV6MhNcnuxeQ1aAYw+JbUljqWgnAQHAwhe5lvNx6JWTyJn9pH4CJFtHRC5myXPsJhQCfsmE8nRs6jW+BoSQc1XpyTmh9EiaNtBUTaOnH8k9VoA1JhAEBmEboUlzG7XC7JihDQdLSJaAD556RAuBPBrdEDDRio0OQZs-5TXUBSahOCWrbVBrtBhK9FDMnkA6d6W87RmxikXJ2HRYpfzEfOHhZcybq39prYO2tw713gEJY28cSw5z+GoAeJQgRGDkmbc2ZQrbW3wkoABM8544KEYjZ29QnSfkNAUYevwlBTmaE7PIe9UoDTEQA2qxAcCgTcfHIENpEoAkeNaFBrw5ILkScPFQYS-h1FUJEnAhBwK4P0c-G6fxzzEWuFIYsqccxyTaI7WKXQtBNAMBPSwQA */
  createMachine(
    {
      schema: {
        events: {} as
          | { type: "WEBSOCKET_CONNECTED"; websocket: WebSocket }
          | { type: "WEBSOCKET_DISCONNECTED" }
          | { type: "WEBSOCKET_DOCUMENT_NOT_FOUND" }
          | { type: "WEBSOCKET_UNAUTHORIZED" }
          | { type: "WEBSOCKET_ADD_TO_QUEUE"; data: any }
          | { type: "WEBSOCKET_KEY_MATERIAL" }
          | { type: "WEBSOCKET_RETRY" }
          | { type: "DISCONNECT" }
          | { type: "ADD_CHANGE"; data: any }
          | { type: "ADD_EPHEMERAL_UPDATE"; data: any }
          | {
              type: "SEND_EPHEMERAL_UPDATE";
              data: any;
              getEphemeralUpdateKey: () => Promise<Uint8Array>;
            }
          | { type: "SEND"; message: any },
        context: {} as Context,
        services: {} as {
          processQueues: { data: ProcessQueueData };
        },
      },
      tsTypes: {} as import("./syncMachine.typegen").Typegen0,
      predictableActionArguments: true,
      context: {
        documentId: "",
        signatureKeyPair: {} as KeyPair,
        websocketHost: "",
        websocketSessionKey: "",
        applySnapshot: () => undefined,
        getSnapshotKey: () => Promise.resolve(new Uint8Array()),
        applyChanges: () => undefined,
        getNewSnapshotData: () =>
          Promise.resolve({
            id: "",
            data: "",
            key: new Uint8Array(),
            publicData: {},
          }),
        getUpdateKey: () => Promise.resolve(new Uint8Array()),
        applyEphemeralUpdates: () => undefined,
        getEphemeralUpdateKey: () => Promise.resolve(new Uint8Array()),
        shouldSendSnapshot: () => false,

        sodium: {},

        serializeChanges: () => "",
        deserializeChanges: () => [],
        onDocumentLoaded: () => undefined,
        onSnapshotSent: () => undefined,
        _activeSnapshotId: null,
        _latestServerVersion: null,
        _incomingQueue: [],
        _pendingChangesQueue: [],
        _activeSendingSnapshotId: null,
        _shouldReconnect: false,
        _websocketRetries: 0,
        _updatesInFlight: [],
        _confirmedUpdatesClock: null,
        _sendingUpdatesClock: -1,
      },
      initial: "connecting",
      on: {
        SEND: {
          actions: forwardTo("websocketActor"),
        },
        ADD_EPHEMERAL_UPDATE: {
          actions: sendTo("websocketActor", (context, event) => {
            return {
              type: "SEND_EPHEMERAL_UPDATE",
              data: event.data,
              getEphemeralUpdateKey: context.getEphemeralUpdateKey,
            };
          }),
        },
        WEBSOCKET_DISCONNECTED: { target: "disconnected" },
        DISCONNECT: { target: "disconnected" },
      },
      states: {
        connecting: {
          initial: "waiting",
          states: {
            retrying: {
              entry: ["increaseWebsocketRetry", "spawnWebsocketActor"],
            },
            waiting: {
              invoke: {
                id: "sheduleRetry",
                src: "sheduleRetry",
              },
              on: {
                WEBSOCKET_RETRY: {
                  target: "retrying",
                },
              },
            },
          },
          on: {
            WEBSOCKET_CONNECTED: {
              target: "connected",
            },
          },
        },

        connected: {
          entry: ["resetWebsocketRetries"],
          states: {
            idle: {
              on: {
                WEBSOCKET_ADD_TO_QUEUE: {
                  actions: ["addToIncomingQueue"],
                  target: "processingQueues",
                },
                ADD_CHANGE: {
                  actions: ["addToPendingUpdatesQueue"],
                  target: "processingQueues",
                },
              },
            },

            processingQueues: {
              on: {
                WEBSOCKET_ADD_TO_QUEUE: {
                  actions: ["addToIncomingQueue"],
                },
                ADD_CHANGE: {
                  actions: ["addToPendingUpdatesQueue"],
                },
              },
              invoke: {
                id: "processQueues",
                src: "processQueues",
                onDone: {
                  actions: ["removeOldestItemFromQueueAndUpdateContext"],
                  target: "checkingForMoreQueueItems",
                },
                onError: {
                  target: "#syncMachine.failed",
                },
              },
            },

            checkingForMoreQueueItems: {
              on: {
                WEBSOCKET_ADD_TO_QUEUE: {
                  actions: ["addToIncomingQueue"],
                },

                ADD_CHANGE: {
                  actions: ["addToPendingUpdatesQueue"],
                },
              },

              always: [
                {
                  target: "processingQueues",
                  cond: "hasMoreItemsInQueues",
                },
                "idle",
              ],
            },
          },
          on: {
            WEBSOCKET_DOCUMENT_NOT_FOUND: { target: "final" },
            WEBSOCKET_UNAUTHORIZED: { target: "final" },
            WEBSOCKET_KEY_MATERIAL: {},
          },

          initial: "idle",
        },

        disconnected: {
          entry: ["updateShouldReconnect", "stopWebsocketActor"],
          always: {
            target: "connecting",
            cond: "shouldReconnect",
          },
        },

        final: { type: "final" },
        failed: { type: "final" },
      },
      id: "syncMachine",
    },
    {
      actions: {
        resetWebsocketRetries: assign({
          _websocketRetries: 0,
        }),
        increaseWebsocketRetry: assign((context) => {
          // limit it to 13 to prevent too long apart retries
          if (context._websocketRetries < 13) {
            return { _websocketRetries: context._websocketRetries + 1 };
          }
          return { _websocketRetries: context._websocketRetries };
        }),
        spawnWebsocketActor: assign((context) => {
          return {
            _websocketActor: spawn(websocketService(context), "websocketActor"),
          };
        }),
        stopWebsocketActor: assign((context) => {
          if (context._websocketActor?.stop) {
            context._websocketActor?.stop();
          }
          return {
            _websocketActor: undefined,
          };
        }),
        updateShouldReconnect: assign((context, event) => {
          return {
            _shouldReconnect: event.type !== "DISCONNECT",
          };
        }),
        addToIncomingQueue: assign((context, event) => {
          return {
            _incomingQueue: [...context._incomingQueue, event.data],
          };
        }),
        addToPendingUpdatesQueue: assign((context, event) => {
          return {
            _pendingChangesQueue: [...context._pendingChangesQueue, event.data],
          };
        }),
        removeOldestItemFromQueueAndUpdateContext: assign((context, event) => {
          if (event.data.handledQueue === "incoming") {
            return {
              _incomingQueue: context._incomingQueue.slice(1),
              _pendingChangesQueue: event.data.pendingChangesQueue,
              _activeSnapshotId: event.data.activeSnapshotId,
              _latestServerVersion: event.data.latestServerVersion,
              _activeSendingSnapshotId: event.data.activeSendingSnapshotId,
              _sendingUpdatesClock: event.data.sendingUpdatesClock,
              _confirmedUpdatesClock: event.data.confirmedUpdatesClock,
              _updatesInFlight: event.data.updatesInFlight,
            };
          } else {
            return {
              _pendingChangesQueue: event.data.pendingChangesQueue,
              _activeSnapshotId: event.data.activeSnapshotId,
              _latestServerVersion: event.data.latestServerVersion,
              _activeSendingSnapshotId: event.data.activeSendingSnapshotId,
              _sendingUpdatesClock: event.data.sendingUpdatesClock,
              _confirmedUpdatesClock: event.data.confirmedUpdatesClock,
              _updatesInFlight: event.data.updatesInFlight,
            };
          }
        }),
      },
      services: {
        sheduleRetry: (context) => (callback) => {
          const delay = 100 * 1.8 ** context._websocketRetries;
          console.log("schedule websocket connection in ", delay);
          setTimeout(() => {
            callback("WEBSOCKET_RETRY");
            // calculating slow exponential backoff
          }, delay);
        },
        processQueues: (context, event) => async (send) => {
          console.log("processQueues event", event);
          let activeSnapshotId = context._activeSnapshotId;
          let latestServerVersion = context._latestServerVersion;
          let handledQueue: "incoming" | "pending" | "none" = "none";
          let activeSendingSnapshotId = context._activeSendingSnapshotId;
          let sendingUpdatesClock = context._sendingUpdatesClock;
          let confirmedUpdatesClock = context._confirmedUpdatesClock;
          let updatesInFlight = context._updatesInFlight;
          let pendingChangesQueue = context._pendingChangesQueue;

          const createAndSendSnapshot = async () => {
            const snapshotData = await context.getNewSnapshotData();
            activeSendingSnapshotId = snapshotData.id;
            const publicData = {
              ...snapshotData.publicData,
              snapshotId: snapshotData.id,
              docId: context.documentId,
              pubKey: context.sodium.to_base64(
                context.signatureKeyPair.publicKey
              ),
            };
            const snapshot = createSnapshot(
              snapshotData.data,
              publicData,
              snapshotData.key,
              context.signatureKeyPair
            );

            pendingChangesQueue = [];
            send({
              type: "SEND",
              message: JSON.stringify({
                ...snapshot,
                lastKnownSnapshotId: context._activeSnapshotId,
                latestServerVersion: context._latestServerVersion,
              }),
            });

            if (context.onSnapshotSent) {
              context.onSnapshotSent();
            }
          };

          const createAndSendUpdate = (
            changes: unknown[],
            key: Uint8Array,
            refSnapshotId: string,
            clock: number
          ) => {
            const update = context.serializeChanges(changes);
            sendingUpdatesClock = clock + 1;

            const publicData = {
              refSnapshotId,
              docId: context.documentId,
              pubKey: context.sodium.to_base64(
                context.signatureKeyPair.publicKey
              ),
            };
            const message = createUpdate(
              update,
              publicData,
              key,
              context.signatureKeyPair,
              sendingUpdatesClock
            );

            updatesInFlight.push({
              clock: sendingUpdatesClock,
              changes,
            });
            send({ type: "SEND", message: JSON.stringify(message) });
          };

          const processSnapshot = async (snapshot: SnapshotWithServerData) => {
            const snapshotKey = await context.getSnapshotKey(snapshot);
            const decryptedSnapshot = verifyAndDecryptSnapshot(
              snapshot,
              snapshotKey,
              context.sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            context.applySnapshot(decryptedSnapshot);
            activeSnapshotId = snapshot.publicData.snapshotId;
          };

          const processUpdates = async (updates: UpdateWithServerData[]) => {
            let changes: unknown[] = [];

            for (let update of updates) {
              const key = await context.getUpdateKey(update);
              const updateResult = verifyAndDecryptUpdate(
                update,
                key,
                context.sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
              );

              latestServerVersion = update.serverData.version;
              if (
                update.publicData.pubKey ===
                context.sodium.to_base64(context.signatureKeyPair.publicKey)
              ) {
                confirmedUpdatesClock = update.publicData.clock;
                sendingUpdatesClock = update.publicData.clock;
              }
              const additionalChanges = context.deserializeChanges(
                context.sodium.to_string(updateResult)
              );
              changes = changes.concat(additionalChanges);
            }
            context.applyChanges(changes);
          };

          if (context._incomingQueue.length > 0) {
            handledQueue = "incoming";
            const event = context._incomingQueue[0];
            switch (event.type) {
              case "documentNotFound":
                // TODO stop reconnecting
                break;
              case "unauthorized":
                // TODO stop reconnecting
                break;
              case "document":
                try {
                  activeSnapshotId = event.snapshot.publicData.snapshotId;
                  const snapshot = SnapshotWithServerData.parse(event.snapshot);
                  await processSnapshot(snapshot);

                  const updates = z
                    .array(UpdateWithServerData)
                    .parse(event.updates);
                  await processUpdates(updates);
                  if (context.onDocumentLoaded) {
                    context.onDocumentLoaded();
                  }
                } catch (err) {
                  // TODO
                  console.log("Apply snapshot failed. TODO handle error");
                  console.error(err);
                }

                break;

              case "snapshot":
                console.log("snapshot saved", event);
                const snapshot = SnapshotWithServerData.parse(event.snapshot);
                await processSnapshot(snapshot);
                break;

              case "snapshotSaved":
                console.log("snapshot saved", event);
                activeSnapshotId = event.snapshotId;
                if (activeSnapshotId === activeSendingSnapshotId) {
                  activeSendingSnapshotId = null;
                }
                latestServerVersion = null;
                sendingUpdatesClock = -1;
                confirmedUpdatesClock = null;
                break;
              case "snapshotFailed":
                const parsedEvent = SnapshotFailedEvent.parse(event);
                console.log("snapshot saving failed", event);
                if (parsedEvent.snapshot) {
                  const snapshot = event.snapshot;
                  await processSnapshot(snapshot);
                }
                // TODO test-case:
                // snapshot is sending, but haven’t received confirmation for the updates I already sent
                // currently this breaks (assumption due the incoming and outgoing clock being the same)
                if (parsedEvent.updates) {
                  await processUpdates(parsedEvent.updates);
                }

                console.log("retry send snapshot");
                await createAndSendSnapshot();
                break;

              case "update":
                const update = UpdateWithServerData.parse(event);
                await processUpdates([update]);
                break;
              case "updateSaved":
                console.log("update saved", event);
                latestServerVersion = event.serverVersion;
                confirmedUpdatesClock = event.clock;
                updatesInFlight = updatesInFlight.filter(
                  (updateInFlight) => updateInFlight.clock !== event.clock
                );

                break;
              case "updateFailed":
                console.log(
                  "update saving failed",
                  event.snapshotId,
                  event.clock,
                  event.requiresNewSnapshotWithKeyRotation
                );

                if (event.requiresNewSnapshotWithKeyRotation) {
                  await createAndSendSnapshot();
                } else {
                  const updateIndex = updatesInFlight.findIndex(
                    (updateInFlight) => updateInFlight.clock === event.clock
                  );
                  if (updateIndex !== -1) {
                    updatesInFlight.slice(updateIndex);

                    const changes = updatesInFlight.reduce(
                      (acc, updateInFlight) =>
                        acc.concat(updateInFlight.changes),
                      [] as unknown[]
                    );

                    changes.push(...context._pendingChangesQueue);
                    pendingChangesQueue = [];

                    const key = await context.getUpdateKey(event);

                    if (activeSnapshotId === null) {
                      throw new Error("No active snapshot id");
                    }
                    sendingUpdatesClock = confirmedUpdatesClock ?? -1;
                    updatesInFlight = [];
                    createAndSendUpdate(
                      changes,
                      key,
                      activeSnapshotId,
                      sendingUpdatesClock
                    );
                  }
                }

                break;
              case "ephemeralUpdate":
                const ephemeralUpdateKey =
                  await context.getEphemeralUpdateKey();
                const ephemeralUpdateResult = verifyAndDecryptEphemeralUpdate(
                  event,
                  ephemeralUpdateKey,
                  context.sodium.from_base64(event.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                );
                context.applyEphemeralUpdates([ephemeralUpdateResult]);
                break;
            }
          } else if (
            context._pendingChangesQueue.length > 0 &&
            activeSendingSnapshotId === null
          ) {
            handledQueue = "pending";

            if (
              context.shouldSendSnapshot({
                activeSnapshotId,
                latestServerVersion,
              })
            ) {
              console.log("send snapshot");
              await createAndSendSnapshot();
            } else {
              console.log("send update");
              const key = await context.getUpdateKey(event);
              const rawChanges = context._pendingChangesQueue;
              pendingChangesQueue = [];

              // TODO add a compact changes function to queue and make sure all pending updates are sent as one update
              if (activeSnapshotId === null) {
                throw new Error("No active snapshot id");
              }
              createAndSendUpdate(
                rawChanges,
                key,
                activeSnapshotId,
                sendingUpdatesClock
              );
            }
          }

          return {
            handledQueue,
            activeSnapshotId,
            latestServerVersion,
            activeSendingSnapshotId,
            confirmedUpdatesClock,
            sendingUpdatesClock,
            updatesInFlight,
            pendingChangesQueue,
          };
        },
      },
      guards: {
        hasMoreItemsInQueues: (context) => {
          return (
            context._incomingQueue.length > 0 ||
            context._pendingChangesQueue.length > 0
          );
        },
        shouldReconnect: (context, event) => {
          return context._shouldReconnect;
        },
      },
    }
  );
