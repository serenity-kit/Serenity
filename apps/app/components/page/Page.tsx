import { KeyDerivationTrace2, useYjsSyncMachine } from "@naisho/core";
import {
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  LocalDevice,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { useEffect, useRef, useState } from "react";
import sodium, { KeyPair } from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { Awareness } from "y-protocols/awareness";
import * as Yjs from "yjs";
import Editor from "../../components/editor/Editor";
import { usePage } from "../../context/PageContext";
import {
  Document,
  runDocumentQuery,
  runMeQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
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
  const snapshotKeyRef = useRef<{
    keyDerivationTrace: KeyDerivationTrace2;
    subkeyId: string;
    key: Uint8Array;
  } | null>(null);
  const yAwarenessRef = useRef<Awareness>(new Awareness(yDocRef.current));
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [username, setUsername] = useState("Unknown user");

  const documentName = useActiveDocumentInfoStore(
    (state) => state.documentName
  );

  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );

  let websocketHost = `wss://serenity-dev.fly.dev`;
  if (process.env.NODE_ENV === "development") {
    websocketHost = `ws://localhost:4000`;
  }
  if (process.env.SERENITY_ENV === "e2e") {
    websocketHost = `ws://localhost:4001`;
  }

  const createNewSnapshotKey = async (
    document: Document,
    snapshotId: string
  ) => {
    const workspace = await getWorkspace({
      workspaceId: document.workspaceId!,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey) {
      throw new Error("No workspace key for workspace and device");
    }
    const folder = await getFolder({ id: document.parentFolderId! });
    const keyDerivationTrace = await createFolderKeyDerivationTrace({
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
      folderId: document.parentFolderId,
    });
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

    const parentFolderChainItem =
      folderKeyChainData.trace[folderKeyChainData.trace.length - 1];

    const snapshotKeyData = createSnapshotKey({
      folderKey: parentFolderChainItem.key,
    });

    keyDerivationTrace.trace.push({
      entryId: snapshotId,
      subkeyId: snapshotKeyData.subkeyId,
      parentId: parentFolderChainItem.entryId,
      context: snapshotDerivedKeyContext,
    });

    return {
      key: snapshotKeyData.key,
      subkeyId: snapshotKeyData.subkeyId,
      keyDerivationTrace,
    };
  };

  const [state, send] = useYjsSyncMachine({
    yDoc: yDocRef.current,
    yAwareness: yAwarenessRef.current,
    documentId: docId,
    signatureKeyPair,
    websocketHost,
    websocketSessionKey: sessionKey,
    onDocumentLoaded: () => {
      setDocumentLoaded(true);
    },
    onSnapshotSent: async () => {
      // if the document has a name, update it
      if (documentName) {
        try {
          const updatedDocument = await updateDocumentName({
            documentId: docId,
            workspaceId,
            name: documentName,
            activeDevice,
          });
          updateActiveDocumentInfoStore(updatedDocument, activeDevice);
        } catch (error) {
          console.error(error);
        }
      }
    },
    getNewSnapshotData: async () => {
      const documentResult = await runDocumentQuery({ id: docId });
      const document = documentResult.data?.document;
      if (!document) {
        throw new Error("Document not found");
      }
      const snapshotId = uuidv4();
      // currently we create a new key for every snapshot
      const snapshotKeyData = await createNewSnapshotKey(document, snapshotId);
      return {
        id: snapshotId,
        data: Yjs.encodeStateAsUpdate(yDocRef.current),
        key: sodium.from_base64(snapshotKeyData.key),
        publicData: {
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
          subkeyId: snapshotKeyData.subkeyId,
        },
      };
    },
    getSnapshotKey: async (snapshot) => {
      const snapshotKeyData = await deriveExistingSnapshotKey(
        docId,
        snapshot,
        activeDevice as LocalDevice
      );

      const key = sodium.from_base64(snapshotKeyData.key);
      snapshotKeyRef.current = {
        keyDerivationTrace: snapshot.publicData.keyDerivationTrace,
        subkeyId: snapshot.publicData.subkeyId,
        key,
      };
      setActiveSnapshotAndCommentKeys(
        {
          id: snapshot.publicData.snapshotId,
          key: snapshotKeyData.key,
        },
        {}
      );

      return key;
    },
    getUpdateKey: async (update) => {
      return snapshotKeyRef.current?.key as Uint8Array;
    },
    shouldSendSnapshot: ({ latestServerVersion }) => {
      // create a new snapshot if the active snapshot has more than 100 updates
      return latestServerVersion !== null && latestServerVersion > 10;
    },
    getEphemeralUpdateKey: async () => {
      return snapshotKeyRef.current?.key as Uint8Array;
    },
    sodium,
  });

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
        setDocumentLoaded(true);
      }

      const me = await runMeQuery({});
      setUsername(me.data?.me?.username ?? "Unknown user");

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

      // remove awareness state when closing the window
      // TODO re-add
      // window.addEventListener("beforeunload", () => {
      // removeAwarenessStates(
      //   yAwarenessRef.current,
      //   [yDocRef.current.clientID],
      //   "window unload"
      // );
      // });

      // TODO switch to v2 updates
      yDocRef.current.on("update", async (update, origin) => {
        // TODO pending updates should be stored in the local db if possible (not possible on web)
        // TODO pending updates should be sent when the websocket connection is re-established
        setLocalDocument({
          id: docId,
          content: Yjs.encodeStateAsUpdate(yDocRef.current),
        });
      });
    }

    initDocument();

    return () => {};
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
      documentLoaded={documentLoaded}
      username={username}
    />
  );
}
