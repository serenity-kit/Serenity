import {
  addSnapshotToInProgress,
  cleanupUpdates,
  createSnapshot,
  dispatchWebsocketState,
  getWebsocketState,
  syncMachine,
  useWebsocketState,
} from "@naisho/core";
import {
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  LocalDevice,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { useMachine } from "@xstate/react";
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
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
import { getSessionKey } from "../../utils/authentication/sessionKeyStore";
import { deriveExistingSnapshotKey } from "../../utils/deriveExistingSnapshotKey/deriveExistingSnapshotKey";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { getDocument } from "../../utils/document/getDocument";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { createFolderKeyDerivationTrace } from "../../utils/folder/createFolderKeyDerivationTrace";
import { getFolder } from "../../utils/folder/getFolder";
import {
  getLocalDocument,
  setLocalDocument,
} from "../../utils/localSqliteApi/localSqliteApi";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

const reconnectTimeout = 2000;

type Props = WorkspaceDrawerScreenProps<"Page"> & {
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
  const { pageId: docId, setActiveSnapshotAndCommentKeys } = usePage();
  const isNew = route.params?.isNew ?? false;
  const { activeDevice, sessionKey } = useAuthenticatedAppContext();
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const snapshotKeyRef = useRef<Uint8Array | null>(null);

  let websocketHost = `wss://serenity-dev.fly.dev`;
  if (process.env.NODE_ENV === "development") {
    websocketHost = `ws://localhost:4000`;
  }
  if (process.env.SERENITY_ENV === "e2e") {
    websocketHost = `ws://localhost:4001`;
  }

  const [state, send] = useMachine(syncMachine, {
    context: {
      documentId: docId,
      signatureKeyPair,
      websocketHost,
      websocketSessionKey: sessionKey,
      documentLoaded: () => {
        setDocumentLoadedInfo({
          loaded: true,
          username: "Unknown user",
        });
      },
      applySnapshot: (decryptedSnapshot) => {
        Yjs.applyUpdate(yDocRef.current, decryptedSnapshot, "naisho-remote");
      },
      getSnapshotKey: async (snapshot) => {
        const snapshotKeyData = await deriveExistingSnapshotKey(
          docId,
          snapshot,
          activeDevice as LocalDevice
        );
        snapshotKeyRef.current = sodium.from_base64(snapshotKeyData.key);
        return snapshotKeyRef.current;
      },
      applyUpdates: (decryptedUpdates) => {
        decryptedUpdates.map((update) => {
          Yjs.applyUpdate(yDocRef.current, update, "naisho-remote");
        });
      },
      getUpdateKey: async (update) => {
        return snapshotKeyRef.current as Uint8Array;
      },
      applyEphemeralUpdates: (decryptedEphemeralUpdates) => {
        decryptedEphemeralUpdates.map((ephemeralUpdate) => {
          applyAwarenessUpdate(yAwarenessRef.current, ephemeralUpdate, null);
        });
      },
      getEphemeralUpdateKey: async () => {
        return snapshotKeyRef.current as Uint8Array;
      },
      sodium,
    },
  });

  console.log("Page state: ", state.value);

  const activeSnapshotIdRef = useRef<string | null>(null);
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
  const documentName = useActiveDocumentInfoStore(
    (state) => state.documentName
  );

  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );

  const createNewSnapshotKey = async (
    document: Document,
    workspaceKeyId: string
  ) => {
    const workspace = await getWorkspace({
      workspaceId: document.workspaceId!,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey) {
      throw new Error("No workspace key for workspace and device");
    }
    const folder = await getFolder({ id: document.parentFolderId! });
    const folderKeyChainData = deriveKeysFromKeyDerivationTrace({
      keyDerivationTrace: folder.keyDerivationTrace,
      activeDevice: {
        signingPublicKey: activeDevice.signingPublicKey,
        signingPrivateKey: activeDevice.signingPrivateKey!,
        encryptionPublicKey: activeDevice.encryptionPublicKey,
        encryptionPrivateKey: activeDevice.encryptionPrivateKey!,
        encryptionPublicKeySignature:
          activeDevice.encryptionPublicKeySignature!,
      },
      workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
    });
    const lastChainItem =
      folderKeyChainData.trace[folderKeyChainData.trace.length - 1];
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
    // TODO: derive snapshot key from folder key
    const keyDerivationTrace = await createFolderKeyDerivationTrace({
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
      folderId: document.parentFolderId!,
    });
    const snapshotId = uuidv4();
    keyDerivationTrace.trace.push({
      entryId: snapshotId,
      parentId: document.parentFolderId,
      subkeyId: snapshotKey.subkeyId,
      context: snapshotDerivedKeyContext,
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
    // if the document has a name, update it
    if (documentName) {
      try {
        const updatedDocument = await updateDocumentName({
          document,
          name: documentName,
          activeDevice,
        });
        // FIXME: do we update this when it's not the active document?
        updateActiveDocumentInfoStore(updatedDocument, activeDevice);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    async function initDocument() {
      await sodium.ready;
      let loaded = false;

      const localDocument = await getLocalDocument(docId);
      if (localDocument) {
        Yjs.applyUpdate(
          yDocRef.current,
          localDocument.content,
          "serenity-local-sqlite"
        );
        loaded = true;
        setDocumentLoadedInfo({
          loaded: true,
          username: "Unknown user",
        });
      }

      const me = await runMeQuery({});
      setDocumentLoadedInfo({
        loaded,
        username: me.data?.me?.username ?? "Unknown user",
      });

      let document: Document | undefined = undefined;
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
        }
      };

      const sessionKey = await getSessionKey();

      const setupWebsocket = () => {
        let host = `wss://serenity-dev.fly.dev`;
        if (process.env.NODE_ENV === "development") {
          host = `ws://localhost:4000`;
        }
        if (process.env.SERENITY_ENV === "e2e") {
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

      // setupWebsocket();

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
        const changedClients = added.concat(updated).concat(removed);
        const yAwarenessUpdate = encodeAwarenessUpdate(
          yAwarenessRef.current,
          changedClients
        );
        send({ type: "ADD_EPHEMERAL_UPDATE", data: yAwarenessUpdate });
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
          send({ type: "ADD_UPDATE", data: update });
          // if (
          //   !activeSnapshotIdRef.current &&
          //   !createSnapshotInProgressRef.current
          // ) {
          //   // createAndSendSnapshot takes a while to set the snapshot in
          //   // progress and therefore we need another mechanism
          //   createSnapshotInProgressRef.current = true;
          //   if (
          //     getSnapshotInProgress(docId) ||
          //     !getWebsocketState().connected
          //   ) {
          //     addPendingSnapshot(docId);
          //   } else {
          //     await createAndSendSnapshot();
          //   }
          // } else {
          //   if (
          //     !snapshotKeyRef.current ||
          //     getSnapshotInProgress(docId) ||
          //     !getWebsocketState().connected
          //   ) {
          //     // don't send updates when a snapshot is in progress, because they
          //     // must be based on the new snapshot
          //     addPendingUpdate(docId, update);
          //   } else {
          //     createAndSendUpdate(update, snapshotKeyRef.current);
          //   }
          // }
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
    />
  );
}
