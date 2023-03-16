import { KeyPair } from "libsodium-wrappers";
import { assign, createMachine, forwardTo, sendTo, spawn } from "xstate";
import {
  createAwarenessUpdate,
  verifyAndDecryptAwarenessUpdate,
} from "./awarenessUpdate";
import {
  addSnapshotToInProgress,
  createSnapshot,
  verifyAndDecryptSnapshot,
} from "./snapshot";
import {
  addUpdateToInProgressQueue,
  createUpdate,
  getUpdateInProgress,
  removeUpdateFromInProgressQueue,
  verifyAndDecryptUpdate,
} from "./update";

type InternalContext = {
  activeSendingSnapshotId: string | null;
};

type ProcessQueueData = {
  handledQueue: "incoming" | "pending" | "none";
  activeSnapshotId: string | null;
  latestServerVersion: number | null;
  activeSendingSnapshotId: string | null;
};

type Context = {
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
  websocketActor?: any;
  incomingQueue: any[];
  pendingChangesQueue: any[];
  sodium: any;
  activeSnapshotId: null | string;
  latestServerVersion: null | number;
  serializeChanges: (changes: unknown[]) => string;
  deserializeChanges: (string) => unknown[];
  onDocumentLoaded: () => void;
  onSnapshotSent: () => void | Promise<void>;
  _internal: InternalContext;
};

// How Queue processing works:
// 1. first handle all incoming message
// 2. then handle all pending updates
// Background: There might be a new snapshot and this way we avoid retries

const websocketService = (context) => (send, onReceive) => {
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

  websocketConnection.addEventListener("error", (event) => {
    console.log("error", event);
  });

  websocketConnection.addEventListener("open", (event) => {
    send({ type: "WEBSOCKET_CONNECTED", websocket: websocketConnection });
  });

  websocketConnection.addEventListener("close", function (event) {
    send({ type: "WEBSOCKET_DISCONNECTED" });
    // remove the awareness states of everyone else
    // removeAwarenessStates(
    //   yAwarenessRef.current,
    //   Array.from(yAwarenessRef.current.getStates().keys()).filter(
    //     (client) => client !== yDocRef.current.clientID
    //   ),
    //   "TODOprovider"
    // );

    // retry connecting
    // if (shouldReconnectWebsocketConnectionRef.current) {
    //   setTimeout(() => {
    //     dispatchWebsocketState({ type: "reconnecting" });
    //     setupWebsocket();
    //   }, reconnectTimeout * (1 + getWebsocketState().unsuccessfulReconnects));
    // }
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
        const awarenessUpdate = createAwarenessUpdate(
          event.data,
          publicData,
          ephemeralUpdateKey,
          context.signatureKeyPair
        );
        console.log("send awarenessUpdate");
        send({ type: "SEND", message: JSON.stringify(awarenessUpdate) });
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
  /** @xstate-layout N4IgpgJg5mDOIC5SwJ4DsDGBZAhhgFgJZpgDEAygKIByAIgNoAMAuoqAA4D2shALoZzRsQAD0QBORuIB0AdgAs8gIyyATEtUBmAKwAOedoA0IFIg0Bfc8dSZcBYmGkZBJDPzRRSAdUoAhcgDyAMIA0pQAKgD6QQHU1JRB4ZQMLMJcPPyCwmIImkry0nryAGyaxaXamqqyxqYIqozahbqaVdpKjZqyxeKW1ujYeEQkTi5gbpDefoGhEZG0AJLkMXEJSSmsSCDpfAJCWzlKrTKyspryZ+dVShq1iLLastLi+nny50rt530gNoP2I2caFcvEmPn8wTCUVowQAqlgaFFqAEogAxAKwuhMTYcbi7LIHMzHORnC6td7qW4mCSaRjSFRKXSfVTFVQtC4-P52YaOIEgsHTSFzTEAQVh4QAEgEAEoLABayWxaTxmX2oEOxNO50uFJuqjuCH0BUYsl0jQap3Eps5A25DlGwPGoIgUwhsyiYQAmpEsCKkrKRQAZJVbHaq7KIPQyJmPHq03QVA3abR082MXSVAzvHo22xDe18p2TRbLWLxRIh3EZPYRhBHTQnUk665UurFWRKaS6SSx4qNRjyXpWX62-OAsYTCDSQgQAA2ZHBMyhkRFtFokXCAUiAEVYZQ95Xtiqa4S68UmufdBnGZoWrJxK2JEoZJJdPeWtps1Jc-8eQ7+VOM7zqQq7roGwRBpEsIAAq0H6lCHmGJ7qmY57SJe14tHeD76tShpaF2JosmSpq6NUP52uOjqTtI7AAE6cBgcA8B424AK5gBxsCkBAgiOMQABunAANaOPRjHMexnFwIhx4EihCCmpohQdO8UiyOmWYGuI6jSPIUiKD0ZriMUCYUWOvITs6tEMUxsAsVAUlcaQYB0QxdG0bOOC8AAZpwdEALY2RJ9lOTJqShnJaqiJGSjFNIA6qC8qgpYo1S6AaCZPFoiVMqyFzduZAKWdR1niXZDlhdxi5ClEoEbluu77ghEVVvi0U5BcTyacUyj6SUGiaAapydhoV4XNovU6DoRV-oWNHlcxxCORxzn1eBQSQTBcFJLJ1byTFCCDspJryClvUaeUxQGu2TSMNUeQNgVDyaLNBZWZATj4OMwnLai-lYP5YBhQsoIBdVgruiua4NTue4Hq1R77R1ZiMFUzwppND4aco4jyJlg7SGU+QlFaeMKG9VEAV9P1-QDQMg2D3HrRBgZQbB8F7e1taqbozz6fkvWMMUz5vsNlTSKo2gvGRA6Mla2iUyV1MELTHj-XRgN0cDq1gKDYDg6QXPhqeHSTXpJSme8pqMDeBp6qoXbnlI+jaFoz6yEr-5FlOqsYL96v09rjMG9x9BKDiSPc6bjTxYZVtdGadt4RowtdoObt4-peiWMOaCcBAcDCFyFnKsjtYALT5NpTQdJ87R6HFyiVF783uFAZfRwpFz22RzRqNU3RXWjxStx9ECdybCnnEmb6FMovXJuIj2NGPpWfUBYCT8hh1kdpZRyOILzS1l6jfMOJfFd7C22UtrG6-AkXl6eihPPITIje2DJH9pz5yIyPRqjtnfumNeKtvr+zpprBmut9bg23gdQ45ouwdDUMLVkPQjB4SPi+ZMOhkyPD0EyL2EBCCwDbpABBKMzyqAKI8JucZyifCGnhcoykrQXCPmdMiOglBex8sQHAs4qE8x6HSPGlRuitEaFaTKKZnjiHaPeXqHQpaqH4TgQg84J5Py7odHueE2R82FpINGb57xWlzuYIAA */
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
        incomingQueue: [],
        pendingChangesQueue: [],
        sodium: {},
        activeSnapshotId: null,
        latestServerVersion: null,
        serializeChanges: () => "",
        deserializeChanges: () => [],
        onDocumentLoaded: () => undefined,
        onSnapshotSent: () => undefined,
        _internal: {
          activeSendingSnapshotId: null,
        },
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
      },
      states: {
        connecting: {
          entry: ["spawnWebsocketActor"],
          on: {
            WEBSOCKET_CONNECTED: {
              target: "connected",
            },
          },
        },
        connected: {
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
            WEBSOCKET_DISCONNECTED: { target: "disconnected" },
            WEBSOCKET_DOCUMENT_NOT_FOUND: { target: "final" },
            WEBSOCKET_UNAUTHORIZED: { target: "final" },
            WEBSOCKET_KEY_MATERIAL: {},
            DISCONNECT: { target: "disconnected" },
          },

          initial: "idle",
        },
        disconnected: {
          entry: ["stopWebsocketActor"],
        },
        final: { type: "final" },
        failed: { type: "final" },
      },
      id: "syncMachine",
    },
    {
      actions: {
        spawnWebsocketActor: assign((context) => {
          return {
            websocketActor: spawn(websocketService(context), "websocketActor"),
          };
        }),
        stopWebsocketActor: assign((context) => {
          context.websocketActor?.stop();
          return {
            websocketActor: undefined,
          };
        }),
        addToIncomingQueue: assign((context, event) => {
          return {
            incomingQueue: [...context.incomingQueue, event.data],
          };
        }),
        addToPendingUpdatesQueue: assign((context, event) => {
          return {
            pendingChangesQueue: [...context.pendingChangesQueue, event.data],
          };
        }),
        removeOldestItemFromQueueAndUpdateContext: assign((context, event) => {
          if (event.data.handledQueue === "incoming") {
            return {
              incomingQueue: context.incomingQueue.slice(1),
              activeSnapshotId: event.data.activeSnapshotId,
              latestServerVersion: event.data.latestServerVersion,
              _internal: {
                activeSendingSnapshotId: event.data.activeSendingSnapshotId,
              },
            };
          } else {
            return {
              pendingChangesQueue: [],
              activeSnapshotId: event.data.activeSnapshotId,
              latestServerVersion: event.data.latestServerVersion,
              _internal: {
                activeSendingSnapshotId: event.data.activeSendingSnapshotId,
              },
            };
          }
        }),
      },
      services: {
        processQueues: (context) => async (send) => {
          let activeSnapshotId = context.activeSnapshotId;
          let latestServerVersion = context.latestServerVersion;
          let handledQueue: "incoming" | "pending" | "none" = "none";
          let activeSendingSnapshotId =
            context._internal.activeSendingSnapshotId;

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

            addSnapshotToInProgress(snapshot);

            send({
              type: "SEND",
              message: JSON.stringify({
                ...snapshot,
                lastKnownSnapshotId: context.activeSnapshotId,
                latestServerVersion: context.latestServerVersion,
              }),
            });
            context.onSnapshotSent();
          };

          const createAndSendUpdate = (
            update: string | Uint8Array,
            key: Uint8Array,
            refSnapshotId: string,
            clockOverwrite?: number
          ) => {
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
              clockOverwrite
            );

            if (clockOverwrite === undefined) {
              addUpdateToInProgressQueue(message, update);
            }
            send({ type: "SEND", message: JSON.stringify(message) });
          };

          if (context.incomingQueue.length > 0) {
            handledQueue = "incoming";
            const event = context.incomingQueue[0];
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
                  const snapshot = event.snapshot;
                  const key = await context.getSnapshotKey(snapshot);
                  const decryptedSnapshot = verifyAndDecryptSnapshot(
                    snapshot,
                    key,
                    context.sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                  );
                  context.applySnapshot(decryptedSnapshot);

                  const updates = event.updates;
                  console.log("updates", updates);
                  const changes = updates
                    .map((update) => {
                      const updateResult = verifyAndDecryptUpdate(
                        update,
                        key,
                        context.sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                      );

                      latestServerVersion = update.serverData.version;
                      const changes = context.deserializeChanges(
                        context.sodium.to_string(updateResult)
                      );
                      return changes;
                    })
                    .flat();
                  context.applyChanges(changes);
                  context.onDocumentLoaded();

                  // setActiveSnapshotAndCommentKeys(
                  //   {
                  //     id: snapshot.publicData.snapshotId,
                  //     key: to_base64(key),
                  //   },
                  //   {} // TODO extract and pass on comment keys from snapshot
                  // );
                } catch (err) {
                  // TODO
                  console.log("Apply snapshot failed. TODO handle error");
                  console.error(err);
                }

                break;

              case "snapshot":
                console.log("snapshot saved", event);
                activeSnapshotId = event.snapshot.publicData.snapshotId;
                const snapshot = event.snapshot;
                const snapshotKey = await context.getSnapshotKey(snapshot);
                const decryptedSnapshot = verifyAndDecryptSnapshot(
                  snapshot,
                  snapshotKey,
                  context.sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                );
                context.applySnapshot(decryptedSnapshot);
                // setActiveSnapshotAndCommentKeys

                break;

              case "snapshotSaved":
                console.log("snapshot saved", event);
                activeSnapshotId = event.snapshotId;
                if (activeSnapshotId === activeSendingSnapshotId) {
                  activeSendingSnapshotId = null;
                }
                latestServerVersion = null;
                break;
              case "snapshotFailed":
                console.log("snapshot saving failed", event);
                if (event.snapshot) {
                  const snapshot = event.snapshot;
                  const snapshotKey = await context.getSnapshotKey(snapshot);
                  const decryptedSnapshot = verifyAndDecryptSnapshot(
                    snapshot,
                    snapshotKey,
                    context.sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                  );
                  context.applySnapshot(decryptedSnapshot);
                }
                // TODO fix test-case:
                // snapshot is sending, but haven’t received confirmation for the updates I already sent
                // currently this breaks (assumption due the incoming and outgoing clock being the same)
                if (event.updates) {
                  for (let update of event.updates) {
                    const key = await context.getUpdateKey(update);
                    const decryptedUpdate = verifyAndDecryptUpdate(
                      update,
                      key,
                      context.sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                    );
                    const changes = context.deserializeChanges(
                      // TODO should this be part deserializeChanges?
                      context.sodium.to_string(decryptedUpdate)
                    );
                    context.applyChanges(changes);
                    latestServerVersion = update.serverData.version;
                  }
                }

                // TODO retry creating a snapshot
                break;

              case "update":
                const key = await context.getUpdateKey(event);
                const decryptedUpdate = verifyAndDecryptUpdate(
                  event,
                  key,
                  context.sodium.from_base64(event.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                );
                const changes = context.deserializeChanges(
                  // TODO should this be part deserializeChanges?
                  context.sodium.to_string(decryptedUpdate)
                );
                context.applyChanges(changes);
                latestServerVersion = event.serverData.version;
                break;
              case "updateSaved":
                console.log("update saved", event);
                latestServerVersion = event.serverVersion;
                removeUpdateFromInProgressQueue(
                  event.docId,
                  event.snapshotId,
                  event.clock
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
                  const key = await context.getUpdateKey(event);

                  // TODO retry with an increasing offset instead of just trying again
                  const rawUpdate = getUpdateInProgress(
                    event.docId,
                    event.snapshotId,
                    event.clock
                  );
                  createAndSendUpdate(rawUpdate, key, event.snapshotId);
                }

                break;
              case "awarenessUpdate":
                const ephemeralUpdateKey =
                  await context.getEphemeralUpdateKey();
                const ephemeralUpdateResult = verifyAndDecryptAwarenessUpdate(
                  event,
                  ephemeralUpdateKey,
                  context.sodium.from_base64(event.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                );
                context.applyEphemeralUpdates([ephemeralUpdateResult]);
                break;
            }
          } else if (
            context.pendingChangesQueue.length > 0 &&
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
              createAndSendSnapshot();
            } else {
              const key = await context.getUpdateKey(event);
              const rawChanges = context.pendingChangesQueue;

              // TODO add a compact changes function to queue and make sure all pending updates are sent as one update
              if (activeSnapshotId === null) {
                throw new Error("No active snapshot id");
              }
              console.log("send update");
              createAndSendUpdate(
                context.serializeChanges(rawChanges),
                key,
                activeSnapshotId
              );
            }
          }

          return {
            handledQueue,
            activeSnapshotId,
            latestServerVersion,
            activeSendingSnapshotId,
          };
        },
      },
      guards: {
        hasMoreItemsInQueues: (context) => {
          return (
            context.incomingQueue.length > 0 ||
            context.pendingChangesQueue.length > 0
          );
        },
      },
    }
  );
