import { assign, createMachine, forwardTo, spawn } from "xstate";
import { verifyAndDecryptSnapshot } from "./snapshot";
import { verifyAndDecryptUpdate } from "./update";

interface Context {
  documentId: string;
  websocketHost: string;
  websocketSessionKey: string;
  applySnapshot: (decryptedSnapshot: any) => void;
  getSnapshotKey: (snapshot: any) => Promise<Uint8Array>;
  applyUpdates: (updates: any[]) => void;
  getUpdateKey: (update: any) => Promise<Uint8Array>;
  documentLoaded: () => void;
  websocketActor?: any;
  incomingQueue: any[];
  sodium: any;
}

// TODO pass in function to verify the creator
// retry logic
// add new document key - add function to handle the new key material
// write a connector for automerge & naisho
// make it work for automerge?
// add every event to a queue and work it off?

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
    // if (event.type === "SEND") {
    //   websocket.send(event.message);
    // }
  });

  return () => {
    // TODO remove event listeners? is this necessary?
    console.log("CLOSE WEBSOCKET");
    websocketConnection.close();
  };
};

export const naishoMachine = createMachine(
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
        | { type: "UPDATE" }
        | { type: "SEND" },
      context: {} as Context,
    },
    tsTypes: {} as import("./machine.typegen").Typegen0,
    predictableActionArguments: true,
    context: {
      documentId: "",
      websocketHost: "",
      websocketSessionKey: "",
      applySnapshot: () => undefined,
      getSnapshotKey: () => Promise.resolve(new Uint8Array()),
      applyUpdates: () => undefined,
      getUpdateKey: () => Promise.resolve(new Uint8Array()),
      documentLoaded: () => undefined,
      incomingQueue: [],
      sodium: {},
    },
    initial: "connecting",
    on: {
      SEND: { actions: forwardTo("websocket") },
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
        invoke: {
          id: "processIncomingQueue",
          src: "processIncomingQueue",
        },
        on: {
          WEBSOCKET_DISCONNECTED: { target: "disconnected" },
          WEBSOCKET_DOCUMENT_NOT_FOUND: { target: "final" },
          WEBSOCKET_UNAUTHORIZED: { target: "final" },
          WEBSOCKET_ADD_TO_QUEUE: {
            actions: ["addToIncomingQueue"],
            target: "connected",
          },
          WEBSOCKET_KEY_MATERIAL: {},
          UPDATE: {},
          DISCONNECT: { target: "disconnected" },
        },
      },
      disconnected: {
        entry: ["stopWebsocketActor"],
        on: {
          UPDATE: {},
        },
      },
      final: { type: "final" },
    },
    id: "machine",
  },
  {
    actions: {
      spawnWebsocketActor: assign((context) => {
        return {
          websocketActor: spawn(websocketService(context)),
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
    },
    services: {
      processIncomingQueue: async (context) => {
        let activeSnapshotId = "";
        let latestServerVersion = null;

        if (context.incomingQueue.length === 0) {
          return;
        }

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
        }
      },
    },
    guards: {},
  }
);
