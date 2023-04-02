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
import { verifyAndDecryptEphemeralUpdate } from "./ephemeralUpdate";
import { createSnapshot, verifyAndDecryptSnapshot } from "./snapshot";
import {
  SnapshotFailedEvent,
  SnapshotPublicData,
  SnapshotWithServerData,
  UpdateWithServerData,
} from "./types";
import { createUpdate, verifyAndDecryptUpdate } from "./update";
import { websocketService } from "./websocketService";

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
// In case a snapshot is sent `_pendingChangesQueue` is cleared and the `_activeSendingSnapshotInfo` set to the snapshot ID.
// In case an update is sent the changes will be added to the `_updatesInFlight` and the `_sendingUpdatesClock` increased by one.
//
// If a snapshot saved event is received
// - the `_activeSnapshotInfo` is set to the snapshot (id, parentSnapshotProof, ciphertextHash)
// - the `_activeSendingSnapshotInfo` is cleared.
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
// - `_activeSnapshotInfo`
// Otherwise you might try to send an update that the server will reject.

type UpdateInFlight = {
  clock: number;
  changes: any[];
};

type UpdateClocks = {
  [snapshotId: string]: { [publicSigningKey: string]: number };
};

type ActiveSnapshotInfo = {
  id: string;
  ciphertext: string;
  parentSnapshotProof: string;
};

type ProcessQueueData = {
  handledQueue: "incoming" | "pending" | "none";
  activeSnapshotInfo: ActiveSnapshotInfo | null;
  latestServerVersion: number | null;
  activeSendingSnapshotInfo: ActiveSnapshotInfo | null;
  sendingUpdatesClock: number;
  confirmedUpdatesClock: number;
  updatesInFlight: UpdateInFlight[];
  pendingChangesQueue: any[];
  updateClocks: UpdateClocks;
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
    readonly additionalServerData?: any;
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
  onSnapshotSaved?: () => void | Promise<void>;
};

export type Context = SyncMachineConfig & {
  _latestServerVersion: null | number;
  _activeSnapshotInfo: null | ActiveSnapshotInfo;
  _websocketActor?: AnyActorRef;
  _incomingQueue: any[];
  _pendingChangesQueue: any[];
  _activeSendingSnapshotInfo: ActiveSnapshotInfo | null;
  _shouldReconnect: boolean;
  _websocketRetries: number;
  _updatesInFlight: UpdateInFlight[];
  _confirmedUpdatesClock: number | null;
  _sendingUpdatesClock: number;
  _updateClocks: UpdateClocks;
};

export const syncMachine =
  /** @xstate-layout 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 */
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
        onSnapshotSaved: () => undefined,
        _activeSnapshotInfo: null,
        _latestServerVersion: null,
        _incomingQueue: [],
        _pendingChangesQueue: [],
        _activeSendingSnapshotInfo: null,
        _shouldReconnect: false,
        _websocketRetries: 0,
        _updatesInFlight: [],
        _confirmedUpdatesClock: null,
        _sendingUpdatesClock: -1,
        _updateClocks: {},
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
              after: {
                // move to the next tick so that the queue is no causing an endless loop of processing
                0: [
                  {
                    target: "processingQueues",
                    cond: "hasMoreItemsInQueues",
                  },
                  { target: "idle" },
                ],
              },
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
              _activeSnapshotInfo: event.data.activeSnapshotInfo,
              _latestServerVersion: event.data.latestServerVersion,
              _activeSendingSnapshotInfo: event.data.activeSendingSnapshotInfo,
              _sendingUpdatesClock: event.data.sendingUpdatesClock,
              _confirmedUpdatesClock: event.data.confirmedUpdatesClock,
              _updatesInFlight: event.data.updatesInFlight,
              _updateClocks: event.data.updateClocks,
            };
          } else {
            return {
              _pendingChangesQueue: event.data.pendingChangesQueue,
              _activeSnapshotInfo: event.data.activeSnapshotInfo,
              _latestServerVersion: event.data.latestServerVersion,
              _activeSendingSnapshotInfo: event.data.activeSendingSnapshotInfo,
              _sendingUpdatesClock: event.data.sendingUpdatesClock,
              _confirmedUpdatesClock: event.data.confirmedUpdatesClock,
              _updatesInFlight: event.data.updatesInFlight,
              _updateClocks: event.data.updateClocks,
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
          console.log("_incomingQueue", context._incomingQueue.length);
          console.log(
            "_pendingChangesQueue",
            context._pendingChangesQueue.length
          );

          let activeSnapshotInfo = context._activeSnapshotInfo;
          let latestServerVersion = context._latestServerVersion;
          let handledQueue: "incoming" | "pending" | "none" = "none";
          let activeSendingSnapshotInfo = context._activeSendingSnapshotInfo;
          let sendingUpdatesClock = context._sendingUpdatesClock;
          let confirmedUpdatesClock = context._confirmedUpdatesClock;
          let updatesInFlight = context._updatesInFlight;
          let pendingChangesQueue = context._pendingChangesQueue;
          let updateClocks = context._updateClocks;

          const createAndSendSnapshot = async () => {
            if (activeSnapshotInfo === null) {
              throw new Error("No active snapshot");
            }
            const snapshotData = await context.getNewSnapshotData();
            console.log("createAndSendSnapshot", snapshotData);

            const publicData: SnapshotPublicData = {
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
              context.signatureKeyPair,
              context.sodium.from_base64(activeSnapshotInfo.ciphertext),
              context.sodium.from_base64(activeSnapshotInfo.parentSnapshotProof)
            );

            activeSendingSnapshotInfo = {
              id: snapshot.publicData.snapshotId,
              ciphertext: snapshot.ciphertext,
              parentSnapshotProof: snapshot.publicData.parentSnapshotProof,
            };
            pendingChangesQueue = [];

            send({
              type: "SEND",
              message: JSON.stringify({
                ...snapshot,
                lastKnownSnapshotId: activeSnapshotInfo.id,
                latestServerVersion,
                additionalServerData: snapshotData.additionalServerData,
              }),
            });
          };

          const createAndSendUpdate = (
            changes: unknown[],
            key: Uint8Array,
            refSnapshotId: string,
            clock: number
          ) => {
            // console.log("createAndSendUpdate", key);
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
            console.log("processSnapshot", snapshot);
            const snapshotKey = await context.getSnapshotKey(snapshot);
            // console.log("processSnapshot key", snapshotKey);
            const decryptedSnapshot = verifyAndDecryptSnapshot(
              snapshot,
              snapshotKey,
              context.sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            // TODO reset the clocks for the snapshot for the signing key
            context.applySnapshot(decryptedSnapshot);
            activeSnapshotInfo = {
              id: snapshot.publicData.snapshotId,
              ciphertext: snapshot.ciphertext,
              parentSnapshotProof: snapshot.publicData.parentSnapshotProof,
            };
            latestServerVersion = snapshot.serverData.latestVersion;
            confirmedUpdatesClock = null;
            sendingUpdatesClock = -1;
          };

          const processUpdates = async (updates: UpdateWithServerData[]) => {
            let changes: unknown[] = [];

            for (let update of updates) {
              const key = await context.getUpdateKey(update);
              // console.log("processUpdates key", key);
              if (activeSnapshotInfo === null) {
                throw new Error("No active snapshot");
              }
              const currentClock =
                updateClocks[activeSnapshotInfo.id] &&
                Number.isInteger(
                  updateClocks[activeSnapshotInfo.id][update.publicData.pubKey]
                )
                  ? updateClocks[activeSnapshotInfo.id][
                      update.publicData.pubKey
                    ]
                  : -1;
              const { content, clock } = verifyAndDecryptUpdate(
                update,
                key,
                context.sodium.from_base64(update.publicData.pubKey), // TODO check if this pubkey is part of the allowed collaborators
                currentClock
              );
              const existingClocks = updateClocks[activeSnapshotInfo.id] || {};
              updateClocks[activeSnapshotInfo.id] = {
                ...existingClocks,
                [update.publicData.pubKey]: clock,
              };

              latestServerVersion = update.serverData.version;
              if (
                update.publicData.pubKey ===
                context.sodium.to_base64(context.signatureKeyPair.publicKey)
              ) {
                confirmedUpdatesClock = update.publicData.clock;
                sendingUpdatesClock = update.publicData.clock;
              }
              const additionalChanges = context.deserializeChanges(
                context.sodium.to_string(content)
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
                  activeSnapshotInfo = {
                    id: event.snapshot.publicData.snapshotId,
                    ciphertext: event.snapshot.ciphertext,
                    parentSnapshotProof:
                      event.snapshot.publicData.parentSnapshotProof,
                  };
                  console.log(event.snapshot);
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
                  console.log("Apply document failed. TODO handle error");
                  console.error(err);
                }

                break;

              case "snapshot":
                console.log("snapshot", event);
                try {
                  const snapshot = SnapshotWithServerData.parse(event.snapshot);
                  console.log("snapshot parsed");
                  await processSnapshot(snapshot);
                } catch (err) {
                  console.log("Apply snapshot failed. TODO handle error", err);
                  // TODO
                }

                break;

              case "snapshotSaved":
                console.log("snapshot saved", event);
                // in case the event is received for a snapshot that was not active in sending
                // we remove the activeSendingSnapshotInfo since any activeSendingSnapshotInfo
                // that is in flight will fail
                if (event.snapshotId !== activeSendingSnapshotInfo?.id) {
                  throw new Error(
                    "Received snapshotSaved for other than the current activeSendingSnapshotInfo"
                  );
                }
                activeSnapshotInfo = activeSendingSnapshotInfo;
                activeSendingSnapshotInfo = null;
                latestServerVersion = null;
                sendingUpdatesClock = -1;
                confirmedUpdatesClock = null;
                if (context.onSnapshotSaved) {
                  context.onSnapshotSaved();
                }
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

                    if (activeSnapshotInfo === null) {
                      throw new Error("No active snapshot");
                    }
                    sendingUpdatesClock = confirmedUpdatesClock ?? -1;
                    updatesInFlight = [];
                    createAndSendUpdate(
                      changes,
                      key,
                      activeSnapshotInfo.id,
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
            activeSendingSnapshotInfo === null
          ) {
            handledQueue = "pending";

            if (
              context.shouldSendSnapshot({
                activeSnapshotId: activeSnapshotInfo?.id || null,
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
              if (activeSnapshotInfo === null) {
                throw new Error("No active snapshot");
              }
              createAndSendUpdate(
                rawChanges,
                key,
                activeSnapshotInfo.id,
                sendingUpdatesClock
              );
            }
          }

          return {
            handledQueue,
            activeSnapshotInfo,
            latestServerVersion,
            activeSendingSnapshotInfo,
            confirmedUpdatesClock,
            sendingUpdatesClock,
            updatesInFlight,
            pendingChangesQueue,
            updateClocks,
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
