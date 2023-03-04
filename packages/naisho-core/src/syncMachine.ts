import { KeyPair } from "libsodium-wrappers";
import { assign, createMachine, forwardTo, spawn } from "xstate";
import { verifyAndDecryptSnapshot } from "./snapshot";
import { createUpdate, verifyAndDecryptUpdate } from "./update";

interface Context {
  documentId: string;
  signatureKeyPair: KeyPair;
  websocketHost: string;
  websocketSessionKey: string;
  applySnapshot: (decryptedSnapshot: any) => void;
  getSnapshotKey: (snapshot: any) => Promise<Uint8Array>;
  applyUpdates: (updates: any[]) => void;
  getUpdateKey: (update: any) => Promise<Uint8Array>;
  documentLoaded: () => void;
  websocketActor?: any;
  incomingQueue: any[];
  pendingUpdatesQueue: any[];
  sodium: any;
  activeSnapshotId: null | string;
  latestServerVersion: null | number;
}

// TODO pass in function to verify the creator
// retry logic
// add new document key - add function to handle the new key material
// write a connector for automerge & naisho
// make it work for automerge?
// add every event to a queue and work it off?
// process queues in parallel to avoid blocking each other

// Queue processing
// first handle all incoming message
// then handle all pending updates
// Background: there might be a new snapshot and this way we avoid retries

// TODO remove event listener

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
          | { type: "ADD_LOCAL_UPDATE"; data: any }
          | { type: "SEND"; message: any },
        context: {} as Context,
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
        applyUpdates: () => undefined,
        getUpdateKey: () => Promise.resolve(new Uint8Array()),
        documentLoaded: () => undefined,
        incomingQueue: [],
        pendingUpdatesQueue: [],
        sodium: {},
        activeSnapshotId: null,
        latestServerVersion: null,
      },
      initial: "connecting",
      on: {
        SEND: {
          actions: forwardTo("websocketActor"),
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
                ADD_LOCAL_UPDATE: {
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
                ADD_LOCAL_UPDATE: {
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

                ADD_LOCAL_UPDATE: {
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
            pendingUpdatesQueue: [...context.pendingUpdatesQueue, event.data],
          };
        }),
        removeOldestItemFromQueueAndUpdateContext: assign((context, event) => {
          if (event.data.handledQueue === "incoming") {
            return {
              incomingQueue: context.incomingQueue.slice(1),
              activeSnapshotId: event.data.activeSnapshotId,
              latestServerVersion: event.data.latestServerVersion,
            };
          } else {
            return {
              pendingUpdatesQueue: context.pendingUpdatesQueue.slice(1),
              activeSnapshotId: event.data.activeSnapshotId,
              latestServerVersion: event.data.latestServerVersion,
            };
          }
        }),
      },
      services: {
        processQueues: (context) => async (send) => {
          let activeSnapshotId = context.activeSnapshotId;
          let latestServerVersion = context.latestServerVersion;
          let handledQueue: "incoming" | "pending" | "none" = "none";

          const createAndSendUpdate = (
            update,
            key,
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

            send({ type: "SEND", message: JSON.stringify(message) });

            // if (clockOverwrite === undefined) {
            //   addUpdateToInProgressQueue(updateToSend, update);
            // }
            // websocketConnectionRef.current.send(JSON.stringify(updateToSend));
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
                  const decryptedUpdates = updates.map((update) => {
                    const updateResult = verifyAndDecryptUpdate(
                      update,
                      key,
                      context.sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                    );

                    latestServerVersion = update.serverData.version;

                    return updateResult;
                  });
                  context.applyUpdates(decryptedUpdates);
                  context.documentLoaded();

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

                // // check for pending snapshots or pending updates and run them
                // const pendingChanges = getPending(docId);
                // if (pendingChanges.type === "snapshot") {
                //   await createAndSendSnapshot();
                //   removePending(docId);
                // } else if (pendingChanges.type === "updates") {
                //   // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
                //   removePending(docId);
                //   pendingChanges.rawUpdates.forEach((rawUpdate) => {
                //     createAndSendUpdate(rawUpdate, snapshotKeyRef.current);
                //   });
                // }

                break;

              case "snapshot":
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
                  // setActiveSnapshotAndCommentKeys
                } catch (err) {
                  // TODO
                  console.log("Apply snapshot failed. TODO handle error");
                  console.error(err);
                }
                break;

              case "update":
                const key = await context.getUpdateKey(event);
                const decryptedUpdate = verifyAndDecryptUpdate(
                  event,
                  key,
                  context.sodium.from_base64(event.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
                );
                context.applyUpdates([decryptedUpdate]);

                latestServerVersion = event.serverData.version;
                break;
              case "updateSaved":
                console.log("update saved", event);
                // console.log(
                //   "update saving confirmed",
                //   data.snapshotId,
                //   data.clock
                // );
                // latestServerVersionRef.current = data.serverVersion;
                // removeUpdateFromInProgressQueue(
                //   data.docId,
                //   data.snapshotId,
                //   data.clock
                // );

                break;
              case "updateFailed":
                console.log("update failed", event);

                // console.log(
                //   "update saving failed",
                //   data.snapshotId,
                //   data.clock,
                //   data.requiresNewSnapshotWithKeyRotation
                // );

                // if (data.requiresNewSnapshotWithKeyRotation) {
                //   await createAndSendSnapshot();
                // } else {
                //   // TODO retry with an increasing offset instead of just trying again
                //   const rawUpdate = getUpdateInProgress(
                //     data.docId,
                //     data.snapshotId,
                //     data.clock
                //   );
                //   createAndSendUpdate(
                //     rawUpdate,
                //     snapshotKeyRef.current,
                //     data.clock
                //   );
                // }

                break;
            }
          } else if (context.pendingUpdatesQueue.length > 0) {
            handledQueue = "pending";
            const key = await context.getUpdateKey(event);
            const rawUpdates = context.pendingUpdatesQueue;
            // add a compact changes function to queue and make sure all pending updates are sent as one update
            if (activeSnapshotId === null) {
              throw new Error("No active snapshot id");
            }
            createAndSendUpdate(rawUpdates[0], key, activeSnapshotId);
          }

          return {
            handledQueue,
            activeSnapshotId,
            latestServerVersion,
          };
        },
      },
      guards: {
        hasMoreItemsInQueues: (context) => {
          return (
            context.incomingQueue.length > 0 ||
            context.pendingUpdatesQueue.length > 0
          );
        },
      },
    }
  );
