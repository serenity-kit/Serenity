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
import { hash } from "./crypto";
import { verifyAndDecryptEphemeralUpdate } from "./ephemeralUpdate";
import { NaishoProcessingEphemeralUpdateError } from "./errors";
import { createSnapshot, verifyAndDecryptSnapshot } from "./snapshot";
import { isValidAncestorSnapshot } from "./snapshot/isValidAncestorSnapshot";
import { parseEphemeralUpdateWithServerData } from "./snapshot/parseEphemeralUpdateWithServerData";
import { parseSnapshotWithServerData } from "./snapshot/parseSnapshotWithServerData";
import { parseUpdatesWithServerData } from "./snapshot/parseUpdatesWithServerData";
import {
  ParentSnapshotProofInfo,
  SnapshotPublicData,
  SnapshotWithServerData,
  SyncMachineConfig,
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
// In order to process incoming and outgoing changes the sync machine uses three queues:
// - _incomingQueue: contains all incoming messages from the server
// - _customMessageQueue: contains all custom incoming messages from the server
// - _pendingChangesQueue: contains all outgoing messages that are not yet sent to the server
//
// How Queue processing works
// -------------------------
// 1. first handle all incoming custom messages
// 2. first handle all incoming message
// 3. then handle all pending updates
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

type MostRecentEphemeralUpdateDatePerPublicSigningKey = {
  [publicSigningKey: string]: Date;
};

type ActiveSnapshotInfo = {
  id: string;
  ciphertext: string;
  parentSnapshotProof: string;
};

type ProcessQueueData = {
  handledQueue: "customMessage" | "incoming" | "pending" | "none";
  activeSnapshotInfo: ActiveSnapshotInfo | null;
  latestServerVersion: number | null;
  activeSendingSnapshotInfo: ActiveSnapshotInfo | null;
  sendingUpdatesClock: number;
  confirmedUpdatesClock: number;
  updatesInFlight: UpdateInFlight[];
  pendingChangesQueue: any[];
  updateClocks: UpdateClocks;
  mostRecentEphemeralUpdateDatePerPublicSigningKey: MostRecentEphemeralUpdateDatePerPublicSigningKey;
  ephemeralUpdateErrors: NaishoProcessingEphemeralUpdateError[];
  documentWasLoaded: boolean;
};

export type Context = SyncMachineConfig & {
  _latestServerVersion: null | number;
  _activeSnapshotInfo: null | ActiveSnapshotInfo;
  _websocketActor?: AnyActorRef;
  _incomingQueue: any[];
  _customMessageQueue: any[];
  _pendingChangesQueue: any[];
  _activeSendingSnapshotInfo: ActiveSnapshotInfo | null;
  _shouldReconnect: boolean;
  _websocketRetries: number;
  _updatesInFlight: UpdateInFlight[];
  _confirmedUpdatesClock: number | null;
  _sendingUpdatesClock: number;
  _updateClocks: UpdateClocks;
  _mostRecentEphemeralUpdateDatePerPublicSigningKey: MostRecentEphemeralUpdateDatePerPublicSigningKey;
  _errorTrace: Error[];
  _ephemeralUpdateErrors: Error[];
  _documentWasLoaded: boolean;
};

export const syncMachine =
  /** @xstate-layout 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 */
  createMachine(
    {
      schema: {
        events: {} as
          | { type: "WEBSOCKET_CONNECTED" }
          | { type: "WEBSOCKET_DISCONNECTED" }
          | { type: "WEBSOCKET_DOCUMENT_NOT_FOUND" }
          | { type: "WEBSOCKET_UNAUTHORIZED" }
          | { type: "WEBSOCKET_ADD_TO_INCOMING_QUEUE"; data: any }
          | { type: "WEBSOCKET_ADD_TO_CUSTOM_MESSAGE_QUEUE"; data: any }
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
        isValidCollaborator: async () => false,
        additionalAuthenticationDataValidations: undefined,
        _activeSnapshotInfo: null,
        _latestServerVersion: null,
        _incomingQueue: [],
        _customMessageQueue: [],
        _pendingChangesQueue: [],
        _activeSendingSnapshotInfo: null,
        _shouldReconnect: false,
        _websocketRetries: 0,
        _updatesInFlight: [],
        _confirmedUpdatesClock: null,
        _sendingUpdatesClock: -1,
        _updateClocks: {},
        _mostRecentEphemeralUpdateDatePerPublicSigningKey: {},
        _errorTrace: [],
        _ephemeralUpdateErrors: [],
        _documentWasLoaded: false,
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
                WEBSOCKET_ADD_TO_INCOMING_QUEUE: {
                  actions: ["addToIncomingQueue"],
                  target: "processingQueues",
                },
                WEBSOCKET_ADD_TO_CUSTOM_MESSAGE_QUEUE: {
                  actions: ["addToCustomMessageQueue"],
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
                WEBSOCKET_ADD_TO_INCOMING_QUEUE: {
                  actions: ["addToIncomingQueue"],
                },
                WEBSOCKET_ADD_TO_CUSTOM_MESSAGE_QUEUE: {
                  actions: ["addToCustomMessageQueue"],
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
                  actions: ["storeErrorInErrorTrace"],
                  target: "#syncMachine.failed",
                },
              },
            },

            checkingForMoreQueueItems: {
              on: {
                WEBSOCKET_ADD_TO_INCOMING_QUEUE: {
                  actions: ["addToIncomingQueue"],
                },
                WEBSOCKET_ADD_TO_CUSTOM_MESSAGE_QUEUE: {
                  actions: ["addToCustomMessageQueue"],
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
        addToCustomMessageQueue: assign((context, event) => {
          return {
            _customMessageQueue: [...context._customMessageQueue, event.data],
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
              _mostRecentEphemeralUpdateDatePerPublicSigningKey:
                event.data.mostRecentEphemeralUpdateDatePerPublicSigningKey,
              _ephemeralUpdateErrors: event.data.ephemeralUpdateErrors,
              _documentWasLoaded: event.data.documentWasLoaded,
            };
          } else if (event.data.handledQueue === "customMessage") {
            return {
              _customMessageQueue: context._customMessageQueue.slice(1),
              _pendingChangesQueue: event.data.pendingChangesQueue,
              _activeSnapshotInfo: event.data.activeSnapshotInfo,
              _latestServerVersion: event.data.latestServerVersion,
              _activeSendingSnapshotInfo: event.data.activeSendingSnapshotInfo,
              _sendingUpdatesClock: event.data.sendingUpdatesClock,
              _confirmedUpdatesClock: event.data.confirmedUpdatesClock,
              _updatesInFlight: event.data.updatesInFlight,
              _updateClocks: event.data.updateClocks,
              _mostRecentEphemeralUpdateDatePerPublicSigningKey:
                event.data.mostRecentEphemeralUpdateDatePerPublicSigningKey,
              _ephemeralUpdateErrors: event.data.ephemeralUpdateErrors,
              _documentWasLoaded: event.data.documentWasLoaded,
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
              _mostRecentEphemeralUpdateDatePerPublicSigningKey:
                event.data.mostRecentEphemeralUpdateDatePerPublicSigningKey,
              _ephemeralUpdateErrors: event.data.ephemeralUpdateErrors,
              _documentWasLoaded: event.data.documentWasLoaded,
            };
          }
        }),
        // @ts-expect-error can't type the onError differently than onDone
        storeErrorInErrorTrace: assign((context, event) => {
          return {
            _errorTrace: [event.data, ...context._errorTrace],
          };
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
            "_customMessageQueue",
            context._customMessageQueue.length
          );
          console.log(
            "_pendingChangesQueue",
            context._pendingChangesQueue.length
          );

          let activeSnapshotInfo: ActiveSnapshotInfo | null =
            context._activeSnapshotInfo;
          let latestServerVersion = context._latestServerVersion;
          let handledQueue: "customMessage" | "incoming" | "pending" | "none" =
            "none";
          let activeSendingSnapshotInfo = context._activeSendingSnapshotInfo;
          let sendingUpdatesClock = context._sendingUpdatesClock;
          let confirmedUpdatesClock = context._confirmedUpdatesClock;
          let updatesInFlight = context._updatesInFlight;
          let pendingChangesQueue = context._pendingChangesQueue;
          let updateClocks = context._updateClocks;
          let mostRecentEphemeralUpdateDatePerPublicSigningKey =
            context._mostRecentEphemeralUpdateDatePerPublicSigningKey;
          let documentWasLoaded = context._documentWasLoaded;

          try {
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
                parentSnapshotClocks: updateClocks[activeSnapshotInfo.id] || {},
              };
              const snapshot = createSnapshot(
                snapshotData.data,
                publicData,
                snapshotData.key,
                context.signatureKeyPair,
                activeSnapshotInfo.ciphertext,
                activeSnapshotInfo.parentSnapshotProof
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

            const processSnapshot = async (
              rawSnapshot: SnapshotWithServerData,
              parentSnapshotProofInfo?: ParentSnapshotProofInfo
            ) => {
              console.log("processSnapshot", rawSnapshot);
              const snapshot = parseSnapshotWithServerData(
                rawSnapshot,
                context.additionalAuthenticationDataValidations?.snapshot ??
                  z.object({})
              );

              const isValidCollaborator = await context.isValidCollaborator(
                snapshot.publicData.pubKey
              );
              if (!isValidCollaborator) {
                throw new Error("Invalid collaborator");
              }

              let parentSnapshotUpdateClock: number | undefined = undefined;

              if (
                parentSnapshotProofInfo &&
                updateClocks[parentSnapshotProofInfo.id]
              ) {
                const currentClientPublicKey = context.sodium.to_base64(
                  context.signatureKeyPair.publicKey
                );
                parentSnapshotUpdateClock =
                  updateClocks[parentSnapshotProofInfo.id][
                    currentClientPublicKey
                  ];
              }

              const snapshotKey = await context.getSnapshotKey(snapshot);
              // console.log("processSnapshot key", snapshotKey);
              const decryptedSnapshot = verifyAndDecryptSnapshot(
                snapshot,
                snapshotKey,
                context.sodium.from_base64(snapshot.publicData.pubKey),
                context.signatureKeyPair.publicKey,
                parentSnapshotProofInfo,
                parentSnapshotUpdateClock
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

            const processUpdates = async (
              rawUpdates: UpdateWithServerData[]
            ) => {
              const updates = parseUpdatesWithServerData(
                rawUpdates,
                context.additionalAuthenticationDataValidations?.update ??
                  z.object({})
              );
              let changes: unknown[] = [];

              for (let update of updates) {
                const key = await context.getUpdateKey(update);
                // console.log("processUpdates key", key);
                if (activeSnapshotInfo === null) {
                  throw new Error("No active snapshot");
                }

                const isValidCollaborator = await context.isValidCollaborator(
                  update.publicData.pubKey
                );
                if (!isValidCollaborator) {
                  throw new Error("Invalid collaborator");
                }

                const currentClock =
                  updateClocks[activeSnapshotInfo.id] &&
                  Number.isInteger(
                    updateClocks[activeSnapshotInfo.id][
                      update.publicData.pubKey
                    ]
                  )
                    ? updateClocks[activeSnapshotInfo.id][
                        update.publicData.pubKey
                      ]
                    : -1;

                const { content, clock } = verifyAndDecryptUpdate(
                  update,
                  key,
                  context.sodium.from_base64(update.publicData.pubKey),
                  currentClock
                );

                const existingClocks =
                  updateClocks[activeSnapshotInfo.id] || {};
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

            if (context._customMessageQueue.length > 0) {
              handledQueue = "customMessage";
              const event = context._customMessageQueue[0];
              if (context.onCustomMessage) {
                await context.onCustomMessage(event);
              }
            } else if (context._incomingQueue.length > 0) {
              handledQueue = "incoming";
              const event = context._incomingQueue[0];
              switch (event.type) {
                case "document":
                  if (context.knownSnapshotInfo) {
                    const isValid = isValidAncestorSnapshot({
                      knownSnapshotProofEntry: {
                        parentSnapshotProof:
                          context.knownSnapshotInfo.parentSnapshotProof,
                        snapshotCiphertextHash:
                          context.knownSnapshotInfo.snapshotCiphertextHash,
                      },
                      snapshotProofChain: event.snapshotProofChain,
                      currentSnapshot: event.snapshot,
                    });
                    if (!isValid) {
                      throw new Error("Invalid ancestor snapshot");
                    }
                  }

                  activeSnapshotInfo = {
                    id: event.snapshot.publicData.snapshotId,
                    ciphertext: event.snapshot.ciphertext,
                    parentSnapshotProof:
                      event.snapshot.publicData.parentSnapshotProof,
                  };

                  await processSnapshot(event.snapshot);

                  if (event.updates) {
                    await processUpdates(event.updates);
                  }
                  documentWasLoaded = true;
                  if (context.onDocumentLoaded) {
                    context.onDocumentLoaded();
                  }

                  break;

                case "snapshot":
                  console.log("snapshot", event);
                  await processSnapshot(
                    event.snapshot,
                    activeSnapshotInfo ? activeSnapshotInfo : undefined
                  );

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
                case "snapshotFailed": // TODO rename to snapshotSaveFailed or similar
                  console.log("snapshot saving failed", event);
                  if (event.snapshot) {
                    const snapshot = parseSnapshotWithServerData(
                      event.snapshot,
                      context.additionalAuthenticationDataValidations
                        ?.snapshot ?? z.object({})
                    );

                    if (activeSnapshotInfo) {
                      const isValid = isValidAncestorSnapshot({
                        knownSnapshotProofEntry: {
                          parentSnapshotProof:
                            activeSnapshotInfo.parentSnapshotProof,
                          snapshotCiphertextHash: hash(
                            activeSnapshotInfo.ciphertext
                          ),
                        },
                        snapshotProofChain: event.snapshotProofChain,
                        currentSnapshot: snapshot,
                      });
                      if (!isValid) {
                        throw new Error(
                          "Invalid ancestor snapshot after snapshotFailed event"
                        );
                      }
                    }

                    await processSnapshot(snapshot);
                  }
                  // TODO test-case:
                  // snapshot is sending, but haven’t received confirmation for the updates I already sent
                  // currently this breaks (assumption due the incoming and outgoing clock being the same)
                  if (event.updates) {
                    await processUpdates(event.updates);
                  }

                  console.log("retry send snapshot");
                  await createAndSendSnapshot();
                  break;

                case "update":
                  await processUpdates([event]);
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
                    event.requiresNewSnapshot
                  );

                  if (event.requiresNewSnapshot) {
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
                  try {
                    const ephemeralUpdate = parseEphemeralUpdateWithServerData(
                      event,
                      context.additionalAuthenticationDataValidations
                        ?.ephemeralUpdate ?? z.object({})
                    );

                    const ephemeralUpdateKey =
                      await context.getEphemeralUpdateKey();

                    const isValidCollaborator =
                      await context.isValidCollaborator(
                        ephemeralUpdate.publicData.pubKey
                      );
                    if (!isValidCollaborator) {
                      throw new Error("Invalid collaborator");
                    }

                    const ephemeralUpdateResult =
                      verifyAndDecryptEphemeralUpdate(
                        ephemeralUpdate,
                        ephemeralUpdateKey,
                        context.sodium.from_base64(
                          ephemeralUpdate.publicData.pubKey
                        ),
                        mostRecentEphemeralUpdateDatePerPublicSigningKey[
                          ephemeralUpdate.publicData.pubKey
                        ]
                      );
                    mostRecentEphemeralUpdateDatePerPublicSigningKey[
                      event.publicData.pubKey
                    ] = ephemeralUpdateResult.date;

                    context.applyEphemeralUpdates([
                      ephemeralUpdateResult.content,
                    ]);
                  } catch (err) {
                    throw new NaishoProcessingEphemeralUpdateError(
                      "Failed to process ephemeral update",
                      err
                    );
                  }
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
              mostRecentEphemeralUpdateDatePerPublicSigningKey,
              ephemeralUpdateErrors: context._ephemeralUpdateErrors,
              documentWasLoaded,
            };
          } catch (error) {
            console.error("Processing queue error:", error);
            if (error instanceof NaishoProcessingEphemeralUpdateError) {
              const newEphemeralUpdateErrors = [
                ...context._ephemeralUpdateErrors,
              ];
              newEphemeralUpdateErrors.unshift(error);
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
                mostRecentEphemeralUpdateDatePerPublicSigningKey,
                ephemeralUpdateErrors: newEphemeralUpdateErrors.slice(0, 20), // avoid a memory leak by storing max 20 errors
                documentWasLoaded,
              };
            } else {
              throw error;
            }
          }
        },
      },
      guards: {
        hasMoreItemsInQueues: (context) => {
          return (
            context._customMessageQueue.length > 0 ||
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
