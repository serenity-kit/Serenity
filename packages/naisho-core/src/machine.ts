import { assign, createMachine, forwardTo, spawn } from "xstate";

interface Context {
  documentId: string;
  websocketHost: string;
  websocketSessionKey: string;
  applyUpdate: (update: any) => void;
  applySnapshot: (snapshot: any) => void;
  websocketActor?: any;
}

// TODO pass in function to verify the creator
// retry logic
// add new document key - add function to handle the new key material
// write a connector for automerge & naisho
// make it work for automerge?

// TODO remove event listener

const websocketService = (context) => (send, onReceive) => {
  console.log("invoke service");
  const websocketConnection = new WebSocket(
    `${context.websocketHost}/${context.documentId}?sessionKey=${context.websocketSessionKey}`
  );

  const onWebsocketMessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "documentNotFound":
        // TODO stop reconnecting
        send("WEBSOCKET_DOCUMENT_NOT_FOUND");
        break;
      case "unauthorized":
        // TODO stop reconnecting
        send("UNAUTHORIZED");
        break;
      case "document":
        // check for pending snapshots or pending updates and run them
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
        send("DOCUMENT", data);
        break;
      case "snapshot":
        // console.log("apply snapshot");
        // const snapshotKeyData2 = await deriveExistingSnapshotKey(
        //   docId,
        //   data.snapshot,
        //   activeDevice as LocalDevice
        // );
        // snapshotKeyRef.current = sodium.from_base64(snapshotKeyData2.key);
        // applySnapshot(data.snapshot, snapshotKeyRef.current);
        // // @ts-expect-error TODO handle later
        // latestServerVersionRef.current = undefined;
        break;
      case "snapshotSaved":
        // console.log("snapshot saving confirmed");
        // activeSnapshotIdRef.current = data.snapshotId;
        // // @ts-expect-error TODO handle later
        // latestServerVersionRef.current = undefined;
        // removeSnapshotInProgress(data.docId);

        // const pending = getPending(data.docId);
        // if (pending.type === "snapshot") {
        //   await createAndSendSnapshot();
        //   removePending(data.docId);
        // } else if (pending.type === "updates") {
        //   // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
        //   removePending(data.docId);
        //   pending.rawUpdates.forEach((rawUpdate) => {
        //     createAndSendUpdate(rawUpdate, snapshotKeyRef.current);
        //   });
        // }
        break;
      case "snapshotFailed":
        // console.log("snapshot saving failed", data);
        // if (data.snapshot) {
        //   const snapshotKeyData3 = await deriveExistingSnapshotKey(
        //     docId,
        //     data.snapshot,
        //     activeDevice as LocalDevice
        //   );
        //   snapshotKeyRef.current = sodium.from_base64(snapshotKeyData3.key);
        //   applySnapshot(data.snapshot, snapshotKeyRef.current);
        // }
        // if (data.updates) {
        //   applyUpdates(data.updates, snapshotKeyRef.current);
        // }

        // // TODO add a backoff after multiple failed tries

        // // removed here since again added in createAndSendSnapshot
        // removeSnapshotInProgress(data.docId);
        // // all pending can be removed since a new snapshot will include all local changes
        // removePending(data.docId);

        // await sleep(1000); // TODO add randomised backoff
        // await createAndSendSnapshot();
        break;
      case "update":
        // const updateResult = verifyAndDecryptUpdate(
        //   data,
        //   snapshotKeyRef.current,
        //   sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
        // );
        // Yjs.applyUpdate(yDocRef.current, updateResult, "naisho-remote");
        // latestServerVersionRef.current = data.serverData.version;
        break;
      case "updateSaved":
        // console.log("update saving confirmed", data.snapshotId, data.clock);
        // latestServerVersionRef.current = data.serverVersion;
        // removeUpdateFromInProgressQueue(
        //   data.docId,
        //   data.snapshotId,
        //   data.clock
        // );

        break;
      case "updateFailed":
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
        //   createAndSendUpdate(rawUpdate, snapshotKeyRef.current, data.clock);
        // }

        break;
      case "awarenessUpdate":
        // const awarenessUpdateResult = verifyAndDecryptAwarenessUpdate(
        //   data,
        //   snapshotKeyRef.current,
        //   sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
        // );
        // console.log("awarenessUpdate");
        // applyAwarenessUpdate(
        //   yAwarenessRef.current,
        //   awarenessUpdateResult,
        //   null
        // );
        break;
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
        | { type: "WEBSOCKET_KEY_MATERIAL" }
        | { type: "WEBSOCKET_DOCUMENT"; data: any }
        | { type: "WEBSOCKET_SNAPSHOT" }
        | { type: "WEBSOCKET_SNAPSHOT_SAVED" }
        | { type: "WEBSOCKET_SNAPSHOT_FAILED" }
        | { type: "WEBSOCKET_UPDATE" }
        | { type: "WEBSOCKET_UPDATE_SAVED" }
        | { type: "WEBSOCKET_UPDATE_FAILED" }
        | { type: "WEBSOCKET_PRESENCE" }
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
      applyUpdate: () => {},
      applySnapshot: () => {},
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
        on: {
          WEBSOCKET_DISCONNECTED: { target: "disconnected" },
          WEBSOCKET_DOCUMENT_NOT_FOUND: { target: "final" },
          WEBSOCKET_UNAUTHORIZED: { target: "final" },
          WEBSOCKET_KEY_MATERIAL: {},
          WEBSOCKET_DOCUMENT: {},
          WEBSOCKET_SNAPSHOT: {},
          WEBSOCKET_SNAPSHOT_SAVED: {},
          WEBSOCKET_SNAPSHOT_FAILED: {},
          WEBSOCKET_UPDATE: {},
          WEBSOCKET_UPDATE_SAVED: {},
          WEBSOCKET_UPDATE_FAILED: {},
          WEBSOCKET_PRESENCE: {},
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
      applyDocument: assign((context, event) => {}),
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
    },
    services: {},
    guards: {},
  }
);
