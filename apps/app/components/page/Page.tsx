import {
  addPendingSnapshot,
  addPendingUpdate,
  addSnapshotToInProgress,
  addUpdateToInProgressQueue,
  cleanupUpdates,
  createAwarenessUpdate,
  createSnapshot,
  createUpdate,
  dispatchWebsocketState,
  getPending,
  getSnapshotInProgress,
  getUpdateInProgress,
  getWebsocketState,
  removePending,
  removeSnapshotInProgress,
  removeUpdateFromInProgressQueue,
  Snapshot,
  useWebsocketState,
  verifyAndDecryptAwarenessUpdate,
  verifyAndDecryptSnapshot,
  verifyAndDecryptUpdate,
} from "@naisho/core";
import {
  createSnapshotKey,
  recreateSnapshotKey,
  sleep,
} from "@serenity-tools/common";
import { useActor } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import sodium, { KeyPair } from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import * as Yjs from "yjs";
import Editor from "../../components/editor/Editor";
import { usePage } from "../../context/PageContext";
import {
  Document,
  runDocumentQuery,
  runMeQuery,
  runWorkspaceQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { PageCommentsDrawerScreenProps } from "../../types/navigationProps";
import { getSessionKey } from "../../utils/authentication/sessionKeyStore";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { getDocument } from "../../utils/document/getDocument";
import { buildKeyDerivationTrace } from "../../utils/folder/buildKeyDerivationTrace";
import { deriveFolderKey } from "../../utils/folder/deriveFolderKeyData";
import { getFolder } from "../../utils/folder/getFolder";
import {
  getLocalDocument,
  setLocalDocument,
} from "../../utils/localSqliteApi/localSqliteApi";

const reconnectTimeout = 2000;

type Props = PageCommentsDrawerScreenProps<"Page"> & {
  updateTitle: (title: string) => void;
  signatureKeyPair: KeyPair;
  workspaceId: string;
};

export default function Page({
  navigation,
  route,
  updateTitle,
  signatureKeyPair,
  workspaceId,
}: Props) {
  const { pageId: docId } = usePage();
  const isNew = route.params?.isNew ?? false;
  const { activeDevice } = useAuthenticatedAppContext();
  const activeSnapshotIdRef = useRef<string | null>(null);
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const yAwarenessRef = useRef<Awareness>(new Awareness(yDocRef.current));
  const websocketConnectionRef = useRef<WebSocket>(null);
  const shouldReconnectWebsocketConnectionRef = useRef(true);
  const createSnapshotInProgressRef = useRef<boolean>(false); // only used for the UI
  const latestServerVersionRef = useRef<number | null>(null);
  const [documentLoadedInfo, setDocumentLoadedInfo] = useState({
    loaded: false,
    username: "Unknown user",
  });
  const websocketState = useWebsocketState();
  const snapshotKeyRef = useRef<Uint8Array | null>(null);

  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );

  const deriveExistingSnapshotKey = async (snapshot: Snapshot) => {
    // derive existing key if snapshot exists
    const document = await getDocument({ documentId: docId });
    const snapshotKeyDerivationTrace = snapshot.publicData.keyDerivationTrace;
    const folderKeyChainData = await deriveFolderKey({
      folderId: document.parentFolderId!,
      workspaceId: document.workspaceId!,
      keyDerivationTrace: snapshotKeyDerivationTrace,
      activeDevice,
    });
    // the last subkey key here is treated like a folder key
    // but since we want to derive a snapshot key, we can just toss
    // the last one out and use the rest
    const lastChainItem = folderKeyChainData[folderKeyChainData.length - 2];
    const snapshotKeyData = recreateSnapshotKey({
      folderKey: lastChainItem.key,
      subkeyId: snapshotKeyDerivationTrace.subkeyId,
    });
    return snapshotKeyData;
  };

  const applySnapshot = (snapshot, key) => {
    try {
      activeSnapshotIdRef.current = snapshot.publicData.snapshotId;
      const initialResult = verifyAndDecryptSnapshot(
        snapshot,
        key,
        sodium.from_base64(snapshot.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
      );
      if (initialResult) {
        Yjs.applyUpdate(yDocRef.current, initialResult, "naisho-remote");
      }
    } catch (err) {
      // TODO
      console.log("Apply snapshot failed. TODO handle error");
      console.error(err);
    }
  };

  const applyUpdates = (updates, key) => {
    try {
      updates.map((update) => {
        console.log(
          update.serverData.version,
          update.publicData.pubKey,
          update.publicData.clock
        );
        const updateResult = verifyAndDecryptUpdate(
          update,
          key,
          sodium.from_base64(update.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
        );
        // when reconnecting the server might send already processed data updates. these then are ignored
        if (updateResult) {
          Yjs.applyUpdate(yDocRef.current, updateResult, "naisho-remote");
          latestServerVersionRef.current = update.serverData.version;
        }
      });
    } catch (err) {
      // TODO
      console.log("Apply updates failed. TODO handle error");
      console.error(err);
    }
  };

  const createNewSnapshotKey = async (
    document: Document,
    workspaceKeyId: string
  ) => {
    const folder = await getFolder({ id: document.parentFolderId! });
    const folderKeyChainData = await deriveFolderKey({
      folderId: document.parentFolderId!,
      workspaceId: document.workspaceId!,
      overrideWithWorkspaceKeyId: workspaceKeyId,
      keyDerivationTrace: folder.keyDerivationTrace,
      activeDevice,
    });
    const lastChainItem = folderKeyChainData[folderKeyChainData.length - 1];
    const snapshotKeyData = createSnapshotKey({
      folderKey: lastChainItem.key,
    });
    return snapshotKeyData;
  };

  const createAndSendSnapshot = async () => {
    const workspaceResult = await runWorkspaceQuery({
      id: workspaceId,
      deviceSigningPublicKey: activeDevice?.signingPublicKey,
    });
    const workspace = workspaceResult?.data?.workspace;
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const documentResult = await runDocumentQuery({ id: docId });
    const document = documentResult.data?.document;
    if (!document) {
      throw new Error("Document not found");
    }
    const snapshotKey = await createNewSnapshotKey(
      document,
      workspace.currentWorkspaceKey?.id!
    );
    snapshotKeyRef.current = sodium.from_base64(snapshotKey.key);
    const yDocState = Yjs.encodeStateAsUpdate(yDocRef.current);
    const keyDerivationTrace = await buildKeyDerivationTrace({
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
      subkeyId: snapshotKey.subkeyId,
      folderId: document.parentFolderId!,
    });
    const publicData = {
      snapshotId: uuidv4(),
      docId,
      pubKey: sodium.to_base64(signatureKeyPair.publicKey),
      keyDerivationTrace,
      subkeyId: snapshotKey.subkeyId,
    };
    const snapshot = createSnapshot(
      yDocState,
      publicData,
      sodium.from_base64(snapshotKey.key),
      signatureKeyPair
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

  const createAndSendUpdate = (update, key, clockOverwrite?: number) => {
    console.log("createAndSendUpdate");
    const publicData = {
      refSnapshotId: activeSnapshotIdRef.current,
      docId,
      pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    };
    const updateToSend = createUpdate(
      update,
      // @ts-expect-error TODO handle later
      publicData,
      key,
      signatureKeyPair,
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

      const localDocument = await getLocalDocument(docId);
      if (localDocument) {
        Yjs.applyUpdate(
          yDocRef.current,
          localDocument.content,
          "serenity-local-sqlite"
        );
        setDocumentLoadedInfo({
          loaded: true,
          username: "Unknown user",
        });
      }

      const me = await runMeQuery({});

      let document: Document | undefined = undefined;
      console.log("fetch document", docId);
      try {
        const fetchedDocument = await getDocument({
          documentId: docId,
        });
        document = fetchedDocument as Document;
      } catch (err) {
        // TODO
        console.error(err);
      }
      if (!document) {
        console.error("Document not found");
        return;
      }
      // communicate to other components e.g. sidebar or topbar
      // the currently active document
      updateActiveDocumentInfoStore(document, activeDevice);

      const onWebsocketMessage = async (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "documentNotFound":
            // TODO stop reconnecting
            break;
          case "unauthorized":
            // TODO stop reconnecting
            break;
          case "document":
            if (data.snapshot) {
              const snapshotKeyData1 = await deriveExistingSnapshotKey(
                data.snapshot
              );
              snapshotKeyRef.current = sodium.from_base64(snapshotKeyData1.key);
              applySnapshot(data.snapshot, snapshotKeyRef.current);
            }
            applyUpdates(data.updates, snapshotKeyRef.current);
            setDocumentLoadedInfo({
              loaded: true,
              username: me.data?.me?.username ?? "Unknown user",
            });

            // check for pending snapshots or pending updates and run them
            const pendingChanges = getPending(docId);
            if (pendingChanges.type === "snapshot") {
              await createAndSendSnapshot();
              removePending(docId);
            } else if (pendingChanges.type === "updates") {
              // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
              removePending(docId);
              pendingChanges.rawUpdates.forEach((rawUpdate) => {
                createAndSendUpdate(rawUpdate, snapshotKeyRef.current);
              });
            }
            break;
          case "snapshot":
            console.log("apply snapshot");
            const snapshotKeyData2 = await deriveExistingSnapshotKey(
              data.snapshot
            );
            snapshotKeyRef.current = sodium.from_base64(snapshotKeyData2.key);
            const snapshotResult = verifyAndDecryptSnapshot(
              data,
              snapshotKeyRef.current,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            activeSnapshotIdRef.current = data.publicData.snapshotId;
            // @ts-expect-error TODO handle later
            latestServerVersionRef.current = undefined;
            Yjs.applyUpdate(yDocRef.current, snapshotResult, "naisho-remote");
            break;
          case "snapshotSaved":
            console.log("snapshot saving confirmed");
            activeSnapshotIdRef.current = data.snapshotId;
            // @ts-expect-error TODO handle later
            latestServerVersionRef.current = undefined;
            removeSnapshotInProgress(data.docId);

            const pending = getPending(data.docId);
            if (pending.type === "snapshot") {
              await createAndSendSnapshot();
              removePending(data.docId);
            } else if (pending.type === "updates") {
              // TODO send multiple pending.rawUpdates as one update, this requires different applying as well
              removePending(data.docId);
              pending.rawUpdates.forEach((rawUpdate) => {
                createAndSendUpdate(rawUpdate, snapshotKeyRef.current);
              });
            }
            break;
          case "snapshotFailed":
            console.log("snapshot saving failed", data);
            if (data.snapshot) {
              const snapshotKeyData3 = await deriveExistingSnapshotKey(
                data.snapshot
              );
              snapshotKeyRef.current = sodium.from_base64(snapshotKeyData3.key);
              applySnapshot(data.snapshot, snapshotKeyRef.current);
            }
            if (data.updates) {
              applyUpdates(data.updates, snapshotKeyRef.current);
            }

            // TODO add a backoff after multiple failed tries

            // removed here since again added in createAndSendSnapshot
            removeSnapshotInProgress(data.docId);
            // all pending can be removed since a new snapshot will include all local changes
            removePending(data.docId);

            await sleep(1000); // TODO add randomised backoff
            await createAndSendSnapshot();
            break;
          case "update":
            const updateResult = verifyAndDecryptUpdate(
              data,
              snapshotKeyRef.current,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            Yjs.applyUpdate(yDocRef.current, updateResult, "naisho-remote");
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
            console.log(
              "update saving failed",
              data.snapshotId,
              data.clock,
              data.requiresNewSnapshotWithKeyRotation
            );

            if (data.requiresNewSnapshotWithKeyRotation) {
              await createAndSendSnapshot();
            } else {
              // TODO retry with an increasing offset instead of just trying again
              const rawUpdate = getUpdateInProgress(
                data.docId,
                data.snapshotId,
                data.clock
              );
              createAndSendUpdate(
                rawUpdate,
                snapshotKeyRef.current,
                data.clock
              );
            }

            break;
          case "awarenessUpdate":
            const awarenessUpdateResult = verifyAndDecryptAwarenessUpdate(
              data,
              snapshotKeyRef.current,
              sodium.from_base64(data.publicData.pubKey) // TODO check if this pubkey is part of the allowed collaborators
            );
            console.log("awarenessUpdate");
            applyAwarenessUpdate(
              yAwarenessRef.current,
              awarenessUpdateResult,
              null
            );
            break;
        }
      };

      const sessionKey = await getSessionKey();

      const setupWebsocket = () => {
        let host = `wss://serenity-dev.fly.dev`;
        if (process.env.NODE_ENV === "development") {
          host = `ws://localhost:4000`;
        }
        if (process.env.IS_E2E_TEST === "true") {
          host = `ws://localhost:4001`;
        }
        const connection = new WebSocket(
          `${host}/${docId}?sessionKey=${sessionKey}`
        );
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
          if (shouldReconnectWebsocketConnectionRef.current) {
            setTimeout(() => {
              dispatchWebsocketState({ type: "reconnecting" });
              setupWebsocket();
            }, reconnectTimeout * (1 + getWebsocketState().unsuccessfulReconnects));
          }
        });
      };

      setupWebsocket();

      // remove awareness state when closing the window
      // TODO re-add
      // window.addEventListener("beforeunload", () => {
      // removeAwarenessStates(
      //   yAwarenessRef.current,
      //   [yDocRef.current.clientID],
      //   "window unload"
      // );
      // });

      yAwarenessRef.current.on("update", ({ added, updated, removed }) => {
        if (!getWebsocketState().connected || !snapshotKeyRef.current) {
          return;
        }

        const changedClients = added.concat(updated).concat(removed);
        const yAwarenessUpdate = encodeAwarenessUpdate(
          yAwarenessRef.current,
          changedClients
        );
        const publicData = {
          docId,
          pubKey: sodium.to_base64(signatureKeyPair.publicKey),
        };
        const awarenessUpdate = createAwarenessUpdate(
          yAwarenessUpdate,
          publicData,
          snapshotKeyRef.current,
          signatureKeyPair
        );
        console.log("send awarenessUpdate");
        // @ts-expect-error TODO handle later
        websocketConnectionRef.current.send(JSON.stringify(awarenessUpdate));
      });

      // TODO switch to v2 updates
      yDocRef.current.on("update", async (update, origin) => {
        // TODO pending updates should be stored in the local db if possible (not possible on web)
        // TODO pending updates should be sent when the websocket connection is re-established
        setLocalDocument({
          id: docId,
          content: Yjs.encodeStateAsUpdate(yDocRef.current),
        });

        if (origin?.key === "y-sync$" || origin === "mobile-webview") {
          if (
            !activeSnapshotIdRef.current &&
            !createSnapshotInProgressRef.current
          ) {
            // createAndSendSnapshot takes a while to set the snapshot in
            // progress and therefore we need another mechanism
            createSnapshotInProgressRef.current = true;

            if (
              getSnapshotInProgress(docId) ||
              !getWebsocketState().connected
            ) {
              addPendingSnapshot(docId);
            } else {
              await createAndSendSnapshot();
            }
          } else {
            if (
              !snapshotKeyRef.current ||
              getSnapshotInProgress(docId) ||
              !getWebsocketState().connected
            ) {
              // don't send updates when a snapshot is in progress, because they
              // must be based on the new snapshot
              addPendingUpdate(docId, update);
            } else {
              createAndSendUpdate(update, snapshotKeyRef.current);
            }
          }
        }
      });
    }

    initDocument();

    return () => {
      removeAwarenessStates(
        yAwarenessRef.current,
        [yDocRef.current.clientID],
        "document unmount"
      );
      cleanupUpdates();
      shouldReconnectWebsocketConnectionRef.current = false;
      websocketConnectionRef.current?.close();
    };
  }, []);

  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);

  return (
    <Editor
      documentId={docId}
      workspaceId={workspaceId}
      yDocRef={yDocRef}
      yAwarenessRef={yAwarenessRef}
      openDrawer={navigation.openDrawer}
      updateTitle={updateTitle}
      isNew={isNew}
      documentLoaded={documentLoadedInfo.loaded}
      username={documentLoadedInfo.username}
      comments={state.context.decryptedComments.map((comment) => {
        return {
          commentId: comment.id,
          from: 0,
          to: 5,
        };
      })}
    />
  );
}
