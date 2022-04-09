import * as Yjs from "yjs";
import { Editor as SerenityEditor } from "@serenity-tools/editor";
import {
  createSnapshot,
  createUpdate,
  createAwarenessUpdate,
  verifyAndDecryptSnapshot,
  verifyAndDecryptUpdate,
  verifyAndDecryptAwarenessUpdate,
  createSignatureKeyPair,
  addUpdateToInProgressQueue,
  removeUpdateFromInProgressQueue,
  getUpdateInProgress,
  addSnapshotToInProgress,
  removeSnapshotInProgress,
  getSnapshotInProgress,
  addPendingUpdate,
  addPendingSnapshot,
  getPending,
  removePending,
  dispatchWebsocketState,
  getWebsocketState,
  useWebsocketState,
} from "@naisho/core";
import { v4 as uuidv4 } from "uuid";
import sodium from "libsodium-wrappers";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import { View, Text } from "@serenity-tools/ui";
import { RootTabScreenProps } from "../types";
import { useEffect, useRef } from "react";

const reconnectTimeout = 2000;

export default function TestEditorScreen({
  navigation,
}: RootTabScreenProps<"EditorScreen">) {
  const docId = "123ef252-c282-4e9d-a403-ad1481d2ad7o";
  const activeSnapshotIdRef = useRef<string | null>(null);
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const yAwarenessRef = useRef<Awareness>(new Awareness(yDocRef.current));
  const websocketConnectionRef = useRef<WebSocket>(null);
  const createSnapshotRef = useRef<boolean>(false); // only used for the UI
  const signatureKeyPairRef = useRef<sodium.KeyPair | null>(null);
  const latestServerVersionRef = useRef<number | null>(null);
  const editorInitializedRef = useRef<boolean>(false);
  const websocketState = useWebsocketState();

  const applySnapshot = async (snapshot, key) => {
    activeSnapshotIdRef.current = snapshot.publicData.snapshotId;
    const initialResult = await verifyAndDecryptSnapshot(
      snapshot,
      key,
      sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
    );
    // @ts-expect-error TODO handle later
    Yjs.applyUpdate(yDocRef.current, initialResult, null);
  };

  const applyUpdates = async (updates, key) => {
    await Promise.all(
      updates.map(async (update) => {
        console.log(
          update.serverData.version,
          update.publicData.pubKey,
          update.publicData.clock
        );
        const updateResult = await verifyAndDecryptUpdate(
          update,
          key,
          sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
        );
        // when reconnecting the server might send already processed data updates. these then are ignored
        if (updateResult) {
          Yjs.applyUpdate(yDocRef.current, updateResult, null);
          latestServerVersionRef.current = update.serverData.version;
        }
      })
    );
  };

  const createAndSendSnapshot = async (key) => {
    const yDocState = Yjs.encodeStateAsUpdate(yDocRef.current);
    const publicData = {
      snapshotId: uuidv4(),
      docId,
      // @ts-expect-error TODO handle later
      pubKey: sodium.to_base64(signatureKeyPairRef.current.publicKey),
    };
    const snapshot = await createSnapshot(
      yDocState,
      publicData,
      key,
      // @ts-expect-error TODO handle later
      signatureKeyPairRef.current
    );

    addSnapshotToInProgress(snapshot);

    // @ts-expect-error TODO handle later
    websocketConnectionRef.current.send(
      JSON.stringify({
        ...snapshot,
        lastKnownSnapshotId: activeSnapshotIdRef.current,
        latestServerVersion: latestServerVersionRef.current,
      })
    );
  };

  const createAndSendUpdate = async (update, key, clockOverwrite?: number) => {
    const publicData = {
      refSnapshotId: activeSnapshotIdRef.current,
      docId,
      // @ts-expect-error TODO handle later
      pubKey: sodium.to_base64(signatureKeyPairRef.current.publicKey),
    };
    const updateToSend = await createUpdate(
      update,
      // @ts-expect-error TODO handle later
      publicData,
      key,
      signatureKeyPairRef.current,
      clockOverwrite
    );

    if (clockOverwrite === undefined) {
      addUpdateToInProgressQueue(updateToSend, update);
    }
    // @ts-expect-error TODO handle later
    websocketConnectionRef.current.send(JSON.stringify(updateToSend));
  };

  useEffect(() => {
    async function initDocument() {
      await sodium.ready;

      yAwarenessRef.current.setLocalStateField("user", {
        name: `User ${yDocRef.current.clientID}`,
      });

      // TODO get key from navigation
      // const key = sodium.from_base64(window.location.hash.slice(1));
      const key = sodium.from_hex(
        "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
      );

      signatureKeyPairRef.current = await createSignatureKeyPair();

      const onWebsocketMessage = async (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "document":
            if (data.snapshot) {
              await applySnapshot(data.snapshot, key);
            }
            await applyUpdates(data.updates, key);
            if (editorInitializedRef.current === false) {
              // TODO initiate editor
              editorInitializedRef.current = true;
            }

            // check for pending snapshots or pending updates and run them
            const pendingChanges = getPending(docId);
            if (pendingChanges.type === "snapshot") {
              await createAndSendSnapshot(key);
              removePending(docId);
            } else if (pendingChanges.type === "updates") {
              // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
              removePending(docId);
              pendingChanges.rawUpdates.forEach(async (rawUpdate) => {
                await createAndSendUpdate(rawUpdate, key);
              });
            }
            break;
          case "snapshot":
            console.log("apply snapshot");
            const snapshotResult = await verifyAndDecryptSnapshot(
              data,
              key,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            activeSnapshotIdRef.current = data.publicData.snapshotId;
            // @ts-expect-error TODO handle later
            latestServerVersionRef.current = undefined;
            // @ts-expect-error TODO handle later
            Yjs.applyUpdate(yDocRef.current, snapshotResult, null);
            break;
          case "snapshotSaved":
            console.log("snapshot saving confirmed");
            activeSnapshotIdRef.current = data.snapshotId;
            // @ts-expect-error TODO handle later
            latestServerVersionRef.current = undefined;
            removeSnapshotInProgress(data.docId);

            const pending = getPending(data.docId);
            if (pending.type === "snapshot") {
              await createAndSendSnapshot(key);
              removePending(data.docId);
            } else if (pending.type === "updates") {
              // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
              removePending(data.docId);
              pending.rawUpdates.forEach(async (rawUpdate) => {
                await createAndSendUpdate(rawUpdate, key);
              });
            }
            break;
          case "snapshotFailed":
            console.log("snapshot saving failed", data);
            if (data.snapshot) {
              await applySnapshot(data.snapshot, key);
            }
            if (data.updates) {
              await applyUpdates(data.updates, key);
            }

            // TODO add a backoff after multiple failed tries

            // removed here since again added in createAndSendSnapshot
            removeSnapshotInProgress(data.docId);
            // all pending can be removed since a new snapshot will include all local changes
            removePending(data.docId);
            await createAndSendSnapshot(key);
            break;
          case "update":
            const updateResult = await verifyAndDecryptUpdate(
              data,
              key,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            // @ts-expect-error TODO handle later
            Yjs.applyUpdate(yDocRef.current, updateResult, null);
            latestServerVersionRef.current = data.serverData.version;
            break;
          case "updateSaved":
            console.log("update saving confirmed", data.snapshotId, data.clock);
            latestServerVersionRef.current = data.serverVersion;
            removeUpdateFromInProgressQueue(
              data.docId,
              data.snapshotId,
              data.clock
            );
            break;
          case "updateFailed":
            console.log("update saving failed", data.snapshotId, data.clock);
            // TODO retry with an increasing offset instead of just trying again
            const rawUpdate = getUpdateInProgress(
              data.docId,
              data.snapshotId,
              data.clock
            );
            await createAndSendUpdate(rawUpdate, key, data.clock);
            break;
          case "awarenessUpdate":
            const awarenessUpdateResult = await verifyAndDecryptAwarenessUpdate(
              data,
              key,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            console.log("awarenessUpdate");
            applyAwarenessUpdate(
              yAwarenessRef.current,
              // @ts-expect-error TODO handle later
              awarenessUpdateResult,
              null
            );
            break;
        }
      };

      const setupWebsocket = () => {
        const host =
          process.env.NODE_ENV === "development"
            ? "ws://localhost:4000"
            : "wss://api.naisho.org";
        const connection = new WebSocket(`${host}/${docId}`);
        // @ts-expect-error TODO handle later
        websocketConnectionRef.current = connection;

        // Listen for messages
        connection.addEventListener("message", onWebsocketMessage);

        connection.addEventListener("open", function (event) {
          console.log("connection opened");
          dispatchWebsocketState({ type: "connected" });
        });

        connection.addEventListener("close", function (event) {
          console.log("connection closed");
          dispatchWebsocketState({ type: "disconnected" });
          // remove the awareness states of everyone else
          removeAwarenessStates(
            yAwarenessRef.current,
            Array.from(yAwarenessRef.current.getStates().keys()).filter(
              (client) => client !== yDocRef.current.clientID
            ),
            "TODOprovider"
          );
          // retry connecting
          setTimeout(() => {
            dispatchWebsocketState({ type: "reconnecting" });
            setupWebsocket();
          }, reconnectTimeout * (1 + getWebsocketState().unsuccessfulReconnects));
        });
      };

      setupWebsocket();

      // remove awareness state when closing the window
      window.addEventListener("beforeunload", () => {
        removeAwarenessStates(
          yAwarenessRef.current,
          [yDocRef.current.clientID],
          "window unload"
        );
      });

      yAwarenessRef.current.on(
        "update",
        async ({ added, updated, removed }) => {
          if (!getWebsocketState().connected) {
            return;
          }

          const changedClients = added.concat(updated).concat(removed);
          const yAwarenessUpdate = encodeAwarenessUpdate(
            yAwarenessRef.current,
            changedClients
          );
          const publicData = {
            docId,
            // @ts-expect-error TODO handle later
            pubKey: sodium.to_base64(signatureKeyPairRef.current.publicKey),
          };
          const awarenessUpdate = await createAwarenessUpdate(
            yAwarenessUpdate,
            publicData,
            key,
            // @ts-expect-error TODO handle later
            signatureKeyPairRef.current
          );
          console.log("send awarenessUpdate");
          // @ts-expect-error TODO handle later
          websocketConnectionRef.current.send(JSON.stringify(awarenessUpdate));
        }
      );

      yDocRef.current.on("update", async (update, origin) => {
        if (origin?.key === "y-sync$") {
          if (!activeSnapshotIdRef.current || createSnapshotRef.current) {
            createSnapshotRef.current = false;

            if (
              getSnapshotInProgress(docId) ||
              !getWebsocketState().connected
            ) {
              addPendingSnapshot(docId);
            } else {
              await createAndSendSnapshot(key);
            }
          } else {
            if (
              getSnapshotInProgress(docId) ||
              !getWebsocketState().connected
            ) {
              // don't send updates when a snapshot is in progress, because they
              // must be based on the new snapshot
              addPendingUpdate(docId, update);
            } else {
              await createAndSendUpdate(update, key);
            }
          }
        }
      });
    }

    initDocument();
  }, []);

  return (
    <View>
      <View>
        <Text>{websocketState.connected ? "Connected" : "Disconnected"}</Text>
      </View>
      <SerenityEditor yDocRef={yDocRef} yAwarenessRef={yAwarenessRef} />
    </View>
  );
}
