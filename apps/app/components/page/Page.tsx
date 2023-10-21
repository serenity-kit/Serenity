import * as documentChain from "@serenity-kit/document-chain";
import {
  KeyDerivationTrace,
  LocalDevice,
  SerenitySnapshotPublicData,
  constructUserFromSerializedUserChain,
  encryptDocumentTitle,
  generateId,
  notNull,
} from "@serenity-tools/common";
import { decryptDocumentTitleBasedOnSnapshotKey } from "@serenity-tools/common/src/decryptDocumentTitleBasedOnSnapshotKey/decryptDocumentTitleBasedOnSnapshotKey";
import { useYjsSync } from "@serenity-tools/secsync";
import {
  Button,
  Description,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  Text,
  View,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { Awareness } from "y-protocols/awareness";
import * as Yjs from "yjs";
import Editor from "../../components/editor/Editor";
import { usePage } from "../../context/PageContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  Document,
  runDocumentChainQuery,
  runDocumentQuery,
  runWorkspaceMembersQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { DocumentState } from "../../types/documentState";
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
import { createNewSnapshotKey } from "../../utils/createNewSnapshotKey/createNewSnapshotKey";
import { deriveExistingSnapshotKey } from "../../utils/deriveExistingSnapshotKey/deriveExistingSnapshotKey";
import { useDocumentTitleStore } from "../../utils/document/documentTitleStore";
import { getDocument } from "../../utils/document/getDocument";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { findVerifiedUserByDeviceSigningPublicKey } from "../../utils/findVerifiedUserByDeviceSigningPublicKey/findVerifiedUserByDeviceSigningPublicKey";
import { getEnvironmentUrls } from "../../utils/getEnvironmentUrls/getEnvironmentUrls";
import {
  getLocalDocument,
  setLocalDocument,
} from "../../utils/localSqliteApi/localSqliteApi";
import { showToast } from "../../utils/toast/showToast";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import { PageLoadingError } from "./PageLoadingError";
import { PageNoAccessError } from "./PageNoAccessError";

type Props = WorkspaceDrawerScreenProps<"Page"> & {
  signatureKeyPair: KeyPair;
  workspaceId: string;
  reloadPage: () => void;
};

export default function Page({
  navigation,
  route,
  signatureKeyPair,
  workspaceId,
  reloadPage,
}: Props) {
  const { pageId: docId, setActiveSnapshotAndCommentKeys } = usePage();
  const isNew = route.params?.isNew ?? false;
  const { activeDevice, sessionKey } = useAuthenticatedAppContext();
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const snapshotKeyRef = useRef<{
    keyDerivationTrace: KeyDerivationTrace;
    key: Uint8Array;
  } | null>(null);
  const snapshotInFlightKeyRef = useRef<{
    keyDerivationTrace: KeyDerivationTrace;
    key: Uint8Array;
  } | null>(null);
  const [documentLoadedFromLocalDb, setDocumentLoadedFromLocalDb] =
    useState(false);
  const [documentLoadedOnceFromRemote, setDocumentLoadedOnceFromRemote] =
    useState(false);
  const [passedDocumentLoadingTimeout, setPassedDocumentLoadingTimeout] =
    useState(false);
  const syncState = useEditorStore((state) => state.syncState);
  const setSyncState = useEditorStore((state) => state.setSyncState);
  const setDocumentState = useEditorStore((state) => state.setDocumentState);
  const setActiveDocumentId = useDocumentTitleStore(
    (state) => state.setActiveDocumentId
  );
  const updateDocumentTitle = useDocumentTitleStore(
    (state) => state.updateDocumentTitle
  );
  const setSnapshotKey = useEditorStore((state) => state.setSnapshotKey);
  const [isClosedErrorModal, setIsClosedErrorModal] = useState(false);
  const ephemeralUpdateErrorsChangedAt = useRef<Date | null>(null);
  const hasEditorSidebar = useHasEditorSidebar();

  const { websocketOrigin } = getEnvironmentUrls();
  const { users, workspaceChainData } = useWorkspace();

  const [state, , , yAwareness] = useYjsSync({
    yDoc: yDocRef.current,
    documentId: docId,
    signatureKeyPair,
    websocketHost: websocketOrigin,
    websocketSessionKey: sessionKey,
    onDocumentUpdated: ({ type, knownSnapshotInfo }) => {
      if (type === "snapshot-saved") {
        snapshotKeyRef.current = snapshotInFlightKeyRef.current;
        snapshotInFlightKeyRef.current = null;
        if (snapshotKeyRef.current) {
          setSnapshotKey(snapshotKeyRef.current.key);
        }
      }
    },
    getNewSnapshotData: async () => {
      const documentResult = await runDocumentQuery({ id: docId });
      const document = documentResult.data?.document;
      if (!document) {
        throw new Error("Document not found");
      }
      const snapshotId = generateId();
      // we create a new key for every snapshot
      const snapshotKeyData = await createNewSnapshotKey({
        document,
        snapshotId,
        activeDevice,
      });
      snapshotInFlightKeyRef.current = {
        keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
        key: sodium.from_base64(snapshotKeyData.key),
      };

      const workspace = await getWorkspace({
        deviceSigningPublicKey: activeDevice.signingPublicKey,
        workspaceId,
      });
      if (!workspace?.currentWorkspaceKey) {
        console.error("Workspace or workspaceKeys not found");
        throw new Error("Workspace or workspaceKeys not found");
      }

      const documentTitle = decryptDocumentTitleBasedOnSnapshotKey({
        snapshotKey: sodium.to_base64(snapshotKeyRef.current!.key),
        ciphertext: document.nameCiphertext,
        nonce: document.nameNonce,
        subkeyId: document.subkeyId,
      });

      const documentTitleData = encryptDocumentTitle({
        title: documentTitle,
        activeDevice,
        snapshot: {
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
        },
        workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
      });

      return {
        id: snapshotId,
        data: Yjs.encodeStateAsUpdateV2(yDocRef.current),
        key: sodium.from_base64(snapshotKeyData.key),
        publicData: {
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
        },
        additionalServerData: { documentTitleData },
      };
    },
    getSnapshotKey: async (snapshotProofInfo) => {
      if (!snapshotProofInfo) {
        throw new Error(
          "SnapshotProofInfo not provided when trying to derive a new key"
        );
      }

      const snapshotKeyData = await deriveExistingSnapshotKey(
        docId,
        snapshotProofInfo.additionalPublicData.keyDerivationTrace,
        activeDevice as LocalDevice
      );

      const key = sodium.from_base64(snapshotKeyData.key);
      snapshotKeyRef.current = {
        keyDerivationTrace:
          snapshotProofInfo.additionalPublicData.keyDerivationTrace,
        key,
      };
      if (snapshotKeyRef.current) {
        setSnapshotKey(snapshotKeyRef.current.key);
      }
      setActiveSnapshotAndCommentKeys(
        {
          id: snapshotProofInfo.snapshotId,
          key: snapshotKeyData.key,
        },
        {}
      );

      return key;
    },
    shouldSendSnapshot: ({ snapshotUpdatesCount }) => {
      // create a new snapshot if the active snapshot has more than 100 updates
      return snapshotUpdatesCount !== null && snapshotUpdatesCount > 100;
    },
    isValidClient: async (signingPublicKey: string) => {
      // TODO this should also work for users that have been removed
      // allow to fetch a user that is or was part of the workspace
      // the must be cross-checked with workspaceChainData

      if (users) {
        const creator = findVerifiedUserByDeviceSigningPublicKey({
          users,
          signingPublicKey,
        });
        if (creator) {
          return true;
        }
      }

      const workspaceMembersQueryResult = await runWorkspaceMembersQuery({
        workspaceId,
      });
      const allUsers = workspaceMembersQueryResult.data?.workspaceMembers?.nodes
        ? workspaceMembersQueryResult.data.workspaceMembers.nodes
            .filter(notNull)
            .map((member) => {
              return constructUserFromSerializedUserChain({
                serializedUserChain: member.user.chain,
              });
            })
        : null;

      const creator2 = findVerifiedUserByDeviceSigningPublicKey({
        users: allUsers,
        signingPublicKey,
      });
      if (Boolean(creator2)) {
        return true;
      } else {
        console.warn(
          "Snapshot, Update or EphemeralUpdate creator could not be validated. Probably since it is an already removed device. This is not yet implemented."
        );
        return true;
        // return false;
      }
    },
    // onCustomMessage: async (message) => {
    //   console.log("CUSTOM MESSAGE:", message);
    // },
    additionalAuthenticationDataValidations: {
      snapshot: SerenitySnapshotPublicData,
    },
    logging: "error",
    sodium,
  });

  const yAwarenessRef = useRef<Awareness>(yAwareness);
  let documentChainStateRef = useRef<documentChain.DocumentChainState>();
  let lastDocumentChainEventRef = useRef<documentChain.DocumentChainEvent>();

  useEffect(() => {
    setTimeout(() => {
      setPassedDocumentLoadingTimeout(true);
    }, 6000);

    async function initDocument() {
      const localDocument = await getLocalDocument(docId);
      if (localDocument) {
        Yjs.applyUpdateV2(
          yDocRef.current,
          localDocument.content,
          "serenity-local-sqlite"
        );
        setDocumentLoadedFromLocalDb(true);
      }

      let document: Document | undefined = undefined;
      try {
        // TODO optimize be either parallelizing or merging documentChain and document query into one
        const documentChainQueryResult = await runDocumentChainQuery({
          documentId: docId,
        });
        const fetchedDocument = await getDocument({
          documentId: docId,
        });
        document = fetchedDocument as Document;

        if (documentChainQueryResult.data?.documentChain?.nodes) {
          const userChainResult = documentChain.resolveState({
            events: documentChainQueryResult.data.documentChain.nodes
              .filter(notNull)
              .map((event) => {
                const data = documentChain.DocumentChainEvent.parse(
                  JSON.parse(event.serializedContent)
                );
                lastDocumentChainEventRef.current = data;
                return data;
              }),
            knownVersion: documentChain.version,
          });
          documentChainStateRef.current = userChainResult.currentState;
        }
      } catch (err) {
        // TODO
        console.error(err);
      }
      if (!document) {
        console.error("Document not found");
        return;
      }
      // communicate to other components e.g. sidebar or top-bar
      // the currently active document
      setActiveDocumentId({ documentId: docId });

      yDocRef.current.on("updateV2", async (update, origin) => {
        // TODO pending updates should be stored in the local db if possible (not possible on web)
        // TODO pending updates should be sent when the websocket connection is re-established
        setLocalDocument({
          id: docId,
          content: Yjs.encodeStateAsUpdateV2(yDocRef.current),
        });
      });
    }

    initDocument();

    return () => {};
  }, []);

  useEffect(() => {
    if (state.context._documentDecryptionState === "complete") {
      setDocumentLoadedOnceFromRemote(true);
    }
  }, [state.context._documentDecryptionState]);

  useEffect(() => {
    if (state.context._ephemeralMessageReceivingErrors.length > 0) {
      const now = new Date(); // Current date and time
      const fiveMinInMs = 60000 * 5;
      const fiveMinsAgo = new Date(now.getTime() - fiveMinInMs);

      if (
        ephemeralUpdateErrorsChangedAt.current === null ||
        ephemeralUpdateErrorsChangedAt.current < fiveMinsAgo
      ) {
        showToast(
          "Can't load or decrypt real-time data from collaborators",
          "info",
          { duration: 15000 }
        );
      }
      ephemeralUpdateErrorsChangedAt.current = new Date();
    }
    // TODO since they are limited to a max length, the length will not be good enough
  }, [state.context._ephemeralMessageReceivingErrors.length]);

  useEffect(() => {
    if (state.matches("failed")) {
      setSyncState({
        variant: "error",
        documentDecryptionState: state.context._documentDecryptionState,
        documentLoadedFromLocalDb,
      });
    } else if (
      state.matches("disconnected") ||
      (state.matches("connecting") && state.context._websocketRetries > 1)
    ) {
      if (syncState.variant === "online") {
        // TODO check for desktop app since there changes will also be stored locally
        if (Platform.OS === "web") {
          showToast(
            "You went offline. Your pending changes will be lost unless you reconnect.",
            "error",
            { duration: 30000 }
          );
        } else {
          showToast(
            "You went offline. Your pending changes will be stored locally and synced when you reconnect.",
            "info",
            { duration: 15000 }
          );
        }
      }
      setSyncState({
        variant: "offline",
        pendingChanges: state.context._pendingChangesQueue.length,
      });
    } else {
      setSyncState({ variant: "online" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.value,
    state.context._websocketRetries,
    state.context._pendingChangesQueue.length,
    documentLoadedFromLocalDb,
    setSyncState,
  ]);

  const documentLoaded =
    documentLoadedFromLocalDb ||
    state.context._documentDecryptionState === "complete" ||
    documentLoadedOnceFromRemote;

  let documentState: DocumentState = "loading";
  if (state.matches("failed")) {
    documentState = "error";
  } else if (documentLoaded) {
    documentState = "active";
  }

  useEffect(() => {
    setDocumentState(documentState);
  }, [documentState, setDocumentState]);

  const updateTitle = async (title: string) => {
    // TODO GET
    const document = await getDocument({
      documentId: docId,
    });
    // this is necessary to propagate document name update to the sidebar and header
    updateDocumentTitle({ documentId: docId, title });
    if (document?.id !== docId) {
      console.error("document ID doesn't match page ID");
      return;
    }
    try {
      await updateDocumentName({
        documentId: docId,
        workspaceId,
        name: title,
        activeDevice,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (state.matches("noAccess")) {
    return <PageNoAccessError />;
  }

  if (
    passedDocumentLoadingTimeout &&
    !documentLoaded &&
    state.context._documentDecryptionState === "pending"
  ) {
    return <PageLoadingError reloadPage={reloadPage} />;
  }

  return (
    <>
      <Modal
        isVisible={!isClosedErrorModal && state.matches("failed")}
        onBackdropPress={() => {
          setIsClosedErrorModal(true);
        }}
      >
        <ModalHeader>
          Failed to load or decrypt {documentLoaded ? "update" : "the page"}
        </ModalHeader>
        <Description variant="modal">
          {documentLoaded
            ? "Incoming page updates couldn't be loaded or decrypted."
            : "The entire page could not be loaded or decrypted, but as much content as possible has been restored."}
        </Description>
        <Description variant="modal">
          {
            "Editing has been disabled, but you still can select and copy the content."
          }
        </Description>
        <Description variant="modal">
          {documentLoaded
            ? "Please save your recent changes and try to reload the page. If the problem persists, please contact support."
            : "Please try to reload the page. If the problem persists, please contact support."}
        </Description>
        <ModalButtonFooter
          confirm={
            <Button
              onPress={() => {
                setIsClosedErrorModal(true);
              }}
              variant="primary"
            >
              Close dialog
            </Button>
          }
          cancel={
            <Button
              onPress={() => {
                reloadPage();
              }}
              variant="secondary"
            >
              Reload page
            </Button>
          }
        />
      </Modal>
      {!hasEditorSidebar && syncState.variant === "offline" ? (
        <View style={tw`bg-gray-200 py-2`}>
          <Text variant="xs" style={tw`mx-auto`}>
            You’re offline. Changes will sync next time you are online.
          </Text>
        </View>
      ) : null}
      <Editor
        editable={!state.matches("failed")}
        documentId={docId}
        workspaceId={workspaceId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        openDrawer={navigation.openDrawer}
        updateTitle={updateTitle}
        isNew={isNew}
        documentLoaded={documentLoaded || state.matches("failed")}
        documentState={documentState}
      />
    </>
  );
}
