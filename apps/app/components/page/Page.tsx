import * as documentChain from "@serenity-kit/document-chain";
import {
  DocumentShareLinkDeviceBox,
  KeyDerivationTrace,
  LocalDevice,
  SerenitySnapshotPublicData,
  deriveSessionAuthorization,
  encryptDocumentTitle,
  encryptSnapshotKeyForShareLinkDevice,
  generateId,
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
import sodium, { KeyPair } from "react-native-libsodium";
import { Awareness } from "y-protocols/awareness";
import * as Yjs from "yjs";
import Editor from "../../components/editor/Editor";
import { usePage } from "../../context/PageContext";
import { Document, runDocumentQuery } from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { getCurrentUserInfo } from "../../store/currentUserInfoStore";
import {
  getDocumentChainEventByHash,
  loadRemoteDocumentChain,
} from "../../store/documentChainStore";
import {
  createOrReplaceDocument,
  getLocalDocument,
} from "../../store/documentStore";
import { loadRemoteUserChainsForWorkspace } from "../../store/userChainStore";
import {
  useCanComment,
  useCanEditDocumentsAndFolders,
} from "../../store/workspaceChainStore";
import {
  WorkspaceMemberDevicesProofLocalDbEntry,
  getLastWorkspaceMemberDevicesProof,
  getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash,
  loadRemoteWorkspaceMemberDevicesProofQuery,
} from "../../store/workspaceMemberDevicesProofStore";
import { DocumentState } from "../../types/documentState";
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
import { createNewSnapshotKey } from "../../utils/createNewSnapshotKey/createNewSnapshotKey";
import { deriveExistingSnapshotKey } from "../../utils/deriveExistingSnapshotKey/deriveExistingSnapshotKey";
import { useActiveDocumentStore } from "../../utils/document/activeDocumentStore";
import { getDocument } from "../../utils/document/getDocument";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { getEnvironmentUrls } from "../../utils/getEnvironmentUrls/getEnvironmentUrls";
import { isValidDeviceSigningPublicKey } from "../../utils/isValidDeviceSigningPublicKey/isValidDeviceSigningPublicKey";
import { OS } from "../../utils/platform/platform";
import { showToast } from "../../utils/toast/showToast";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import { PageLoadingError } from "./PageLoadingError";
import { PageNoAccessError } from "./PageNoAccessError";

type Props = WorkspaceDrawerScreenProps<"Page"> & {
  signatureKeyPair: KeyPair;
  workspaceId: string;
  reloadPage: () => void;
  latestDocumentChainState: documentChain.DocumentChainState;
  isNew: boolean;
};

export default function Page({
  navigation,
  route,
  signatureKeyPair,
  workspaceId,
  reloadPage,
  latestDocumentChainState,
  isNew,
}: Props) {
  const { pageId: docId, setActiveSnapshotAndCommentKeys } = usePage();
  const { activeDevice, sessionKey } = useAuthenticatedAppContext();
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const snapshotKeyRef = useRef<{
    keyDerivationTrace: KeyDerivationTrace;
    key: Uint8Array;
  } | null>(null);
  const snapshotInFlightDataRef = useRef<{
    snapshotKey: {
      keyDerivationTrace: KeyDerivationTrace;
      key: Uint8Array;
    };
    documentChainState: documentChain.DocumentChainState;
    workspaceMemberDevicesProofEntry: WorkspaceMemberDevicesProofLocalDbEntry;
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
  const setActiveDocumentId = useActiveDocumentStore(
    (state) => state.setActiveDocumentId
  );
  const setSnapshotKey = useEditorStore((state) => state.setSnapshotKey);
  const setSnapshotId = useEditorStore((state) => state.setSnapshotId);
  const [isClosedErrorModal, setIsClosedErrorModal] = useState(false);
  const ephemeralUpdateErrorsChangedAt = useRef<Date | null>(null);
  const hasEditorSidebar = useHasEditorSidebar();
  let activeSnapshotDocumentChainStateRef =
    useRef<documentChain.DocumentChainState>();
  let activeSnapshotWorkspaceMemberDevicesProofEntryRef =
    useRef<WorkspaceMemberDevicesProofLocalDbEntry>();

  const cachedSnapshotKeyDataRef = useRef<{
    snapshotId: string;
    key: Uint8Array;
  } | null>(null);

  const { websocketOrigin } = getEnvironmentUrls();

  const [state, , , yAwareness] = useYjsSync({
    yDoc: yDocRef.current,
    documentId: docId,
    signatureKeyPair,
    websocketHost: websocketOrigin,
    websocketSessionKey: deriveSessionAuthorization({ sessionKey })
      .authorization,
    onDocumentUpdated: ({ type, knownSnapshotInfo }) => {
      if (type === "snapshot-saved") {
        if (snapshotInFlightDataRef.current) {
          snapshotKeyRef.current = snapshotInFlightDataRef.current.snapshotKey;
          activeSnapshotDocumentChainStateRef.current =
            snapshotInFlightDataRef.current.documentChainState;
          activeSnapshotWorkspaceMemberDevicesProofEntryRef.current =
            snapshotInFlightDataRef.current.workspaceMemberDevicesProofEntry;
          setSnapshotKey(snapshotKeyRef.current.key);
          setSnapshotId(knownSnapshotInfo.snapshotId);

          const yCommentKeys =
            yDocRef.current.getMap<Uint8Array>("commentKeys");
          const yCommentReplyKeys =
            yDocRef.current.getMap<Uint8Array>("commentReplyKeys");

          setActiveSnapshotAndCommentKeys({
            snapshot: {
              id: knownSnapshotInfo.snapshotId,
              key: sodium.to_base64(snapshotKeyRef.current.key),
            },
            yCommentKeys,
            yCommentReplyKeys,
          });
        }
        snapshotInFlightDataRef.current = null;
      }
    },
    getNewSnapshotData: async ({ id }) => {
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

      const workspaceMemberDevicesProof =
        await loadRemoteWorkspaceMemberDevicesProofQuery({ workspaceId });

      snapshotInFlightDataRef.current = {
        snapshotKey: {
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
          key: sodium.from_base64(snapshotKeyData.key),
        },
        documentChainState: latestDocumentChainState,
        workspaceMemberDevicesProofEntry: workspaceMemberDevicesProof,
      };

      const workspace = await getWorkspace({
        deviceSigningPublicKey: activeDevice.signingPublicKey,
        workspaceId,
      });
      if (!workspace?.currentWorkspaceKey) {
        console.error("Workspace or workspaceKeys not found");
        throw new Error("Workspace or workspaceKeys not found");
      }

      const documentTitleWorkspaceMemberDevicesProof =
        await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
          workspaceId,
          hash: document.nameWorkspaceMemberDevicesProofHash,
        });
      if (!documentTitleWorkspaceMemberDevicesProof) {
        throw new Error(
          "documentTitleWorkspaceMemberDevicesProof not found for document"
        );
      }

      const isValid = isValidDeviceSigningPublicKey({
        signingPublicKey: document.nameCreatorDeviceSigningPublicKey,
        workspaceMemberDevicesProofEntry:
          documentTitleWorkspaceMemberDevicesProof,
        workspaceId,
        minimumRole: "EDITOR",
      });
      if (!isValid) {
        throw new Error(
          "Invalid signing public key for the workspaceMemberDevicesProof for decryptDocumentTitleBasedOnSnapshotKey"
        );
      }

      const documentTitle = decryptDocumentTitleBasedOnSnapshotKey({
        snapshotKey: sodium.to_base64(snapshotKeyRef.current!.key),
        ciphertext: document.nameCiphertext,
        nonce: document.nameNonce,
        subkeyId: document.subkeyId,
        documentId: docId,
        workspaceId,
        workspaceMemberDevicesProof:
          documentTitleWorkspaceMemberDevicesProof.proof,
        signature: document.nameSignature,
        creatorDeviceSigningPublicKey:
          document.nameCreatorDeviceSigningPublicKey,
      });

      const documentTitleData = encryptDocumentTitle({
        title: documentTitle,
        activeDevice,
        snapshot: {
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
        },
        workspaceKeyBox: workspace.currentWorkspaceKey.workspaceKeyBox!,
        workspaceId,
        workspaceKeyId: workspace.currentWorkspaceKey.id,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        documentId: docId,
      });

      let documentShareLinkDeviceBoxes: DocumentShareLinkDeviceBox[] = [];
      documentShareLinkDeviceBoxes = Object.entries(
        latestDocumentChainState.devices
      ).map(([shareLinkDeviceSigningPublicKey, deviceEntry]) => {
        const { documentShareLinkDeviceBox } =
          encryptSnapshotKeyForShareLinkDevice({
            documentId: docId,
            snapshotId: id,
            authorDevice: activeDevice,
            snapshotKey: sodium.from_base64(snapshotKeyData.key),
            shareLinkDevice: {
              signingPublicKey: shareLinkDeviceSigningPublicKey,
              encryptionPublicKey: deviceEntry.encryptionPublicKey,
              encryptionPublicKeySignature: "IGNORE",
            },
          });
        return documentShareLinkDeviceBox;
      });

      // iterate over all comments and write the key into the map
      // existing ones should not be overwritten by this
      // pass to additional data all the commentIds

      // delete a comment should remove the comment key

      // to the commentsMachine pass in the yDoc so the yCommentAndReplyKeys can be extract
      // use the entry from the snapshotKey first and if not fallback to yCommentAndReplyKeys
      // if a key exists for a comment that wasn't returned show a warning!

      // improve comment fetching to only fetch newer comments

      return {
        id: snapshotId,
        data: Yjs.encodeStateAsUpdateV2(yDocRef.current),
        key: sodium.from_base64(snapshotKeyData.key),
        publicData: {
          workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
          keyDerivationTrace: snapshotKeyData.keyDerivationTrace,
          documentChainEventHash: latestDocumentChainState.eventHash,
        },
        additionalServerData: {
          documentTitleData: {
            ciphertext: documentTitleData.ciphertext,
            nonce: documentTitleData.nonce,
            subkeyId: documentTitleData.subkeyId,
            signature: documentTitleData.signature,
            workspaceMemberDevicesProofHash:
              workspaceMemberDevicesProof.proof.hash,
          },
          documentShareLinkDeviceBoxes,
        },
      };
    },
    getSnapshotKey: async (snapshotProofInfo) => {
      if (!snapshotProofInfo) {
        throw new Error(
          "SnapshotProofInfo not provided when trying to derive a new key"
        );
      }
      // return cached result to avoid performance hit
      if (
        cachedSnapshotKeyDataRef.current &&
        cachedSnapshotKeyDataRef.current.snapshotId ===
          snapshotProofInfo.snapshotId
      ) {
        return cachedSnapshotKeyDataRef.current.key;
      }

      activeSnapshotWorkspaceMemberDevicesProofEntryRef.current =
        await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
          workspaceId,
          hash: snapshotProofInfo.additionalPublicData
            .workspaceMemberDevicesProof.hash,
        });

      let activeSnapshotDocumentChainEvent = getDocumentChainEventByHash({
        documentId: docId,
        hash: snapshotProofInfo.additionalPublicData.documentChainEventHash,
      });

      if (!activeSnapshotDocumentChainEvent) {
        // refetch newest chain items and try again before returning an error
        await loadRemoteDocumentChain({ documentId: docId });
        activeSnapshotDocumentChainEvent = getDocumentChainEventByHash({
          documentId: docId,
          hash: snapshotProofInfo.additionalPublicData.documentChainEventHash,
        });

        if (!activeSnapshotDocumentChainEvent) {
          console.error("activeSnapshotDocumentChainState not set");
          throw new Error("activeSnapshotDocumentChainState not set");
        }
      }

      activeSnapshotDocumentChainStateRef.current =
        activeSnapshotDocumentChainEvent.state;

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
        setSnapshotId(snapshotProofInfo.snapshotId);
      }

      const yCommentKeys = yDocRef.current.getMap<Uint8Array>("commentKeys");
      const yCommentReplyKeys =
        yDocRef.current.getMap<Uint8Array>("commentReplyKeys");

      setActiveSnapshotAndCommentKeys({
        snapshot: {
          id: snapshotProofInfo.snapshotId,
          key: snapshotKeyData.key,
        },
        yCommentKeys,
        yCommentReplyKeys,
      });

      cachedSnapshotKeyDataRef.current = {
        snapshotId: snapshotProofInfo.snapshotId,
        key,
      };
      return key;
    },
    shouldSendSnapshot: ({ snapshotUpdatesCount }) => {
      // create a new snapshot if the active snapshot has more than 100 updates
      const tooManyUpdate =
        snapshotUpdatesCount !== null && snapshotUpdatesCount > 100;
      if (tooManyUpdate) return true;
      const lastProof = getLastWorkspaceMemberDevicesProof({ workspaceId });
      if (
        activeSnapshotWorkspaceMemberDevicesProofEntryRef.current?.proof
          .hash !== lastProof.proof.hash
      ) {
        return true;
      }
      return false;
    },
    isValidClient: async (signingPublicKey, publicData) => {
      let workspaceMemberDevicesProofEntry:
        | WorkspaceMemberDevicesProofLocalDbEntry
        | undefined;
      // @ts-expect-error
      if (publicData.snapshotId) {
        // In case of a snapshot the specific workspaceMemberDevicesProof is needed and
        // it needs to be set as active to work for all following updates.
        workspaceMemberDevicesProofEntry =
          await getLocalOrLoadRemoteWorkspaceMemberDevicesProofQueryByHash({
            workspaceId,
            // @ts-expect-error
            hash: publicData.workspaceMemberDevicesProof.hash,
          });
        activeSnapshotWorkspaceMemberDevicesProofEntryRef.current =
          workspaceMemberDevicesProofEntry;
        // @ts-expect-error
      } else if (publicData.refSnapshotId) {
        // this is an update and uses the same workspaceMemberDevicesProof as the snapshot it is based on
        workspaceMemberDevicesProofEntry =
          activeSnapshotWorkspaceMemberDevicesProofEntryRef.current;
        // @ts-expect-error
      } else if (!publicData.snapshotId && !publicData.refSnapshotId) {
        // In case of a ephemeral message getting the latest workspaceMemberDevicesProof should
        // be fetched since the other client get the latest state soon and then will retransmit again
        workspaceMemberDevicesProofEntry =
          await loadRemoteWorkspaceMemberDevicesProofQuery({ workspaceId });
      }

      if (!workspaceMemberDevicesProofEntry) {
        return false;
      }

      const isValid = await isValidDeviceSigningPublicKey({
        workspaceMemberDevicesProofEntry,
        signingPublicKey,
        workspaceId,
        minimumRole: "EDITOR",
      });
      if (isValid) {
        return true;
      }

      await loadRemoteUserChainsForWorkspace({ workspaceId });

      return await isValidDeviceSigningPublicKey({
        workspaceMemberDevicesProofEntry,
        signingPublicKey,
        workspaceId,
        minimumRole: "EDITOR",
      });
    },
    additionalAuthenticationDataValidations: {
      snapshot: SerenitySnapshotPublicData,
    },
    logging: "error",
    sodium,
  });

  const yAwarenessRef = useRef<Awareness>(yAwareness);

  useEffect(() => {
    setTimeout(() => {
      setPassedDocumentLoadingTimeout(true);
    }, 6000);

    async function initDocument() {
      const localDocument = getLocalDocument({ documentId: docId });
      if (localDocument && localDocument.content) {
        Yjs.applyUpdateV2(
          yDocRef.current,
          localDocument.content,
          "serenity-local-sqlite"
        );
        setDocumentLoadedFromLocalDb(true);
      }

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
      // communicate to other components e.g. sidebar or top-bar
      // the currently active document
      setActiveDocumentId({ documentId: docId });

      yDocRef.current.on("updateV2", async (update, origin) => {
        // TODO pending updates should be stored in the local db if possible (not possible on web)
        // TODO pending updates should be sent when the websocket connection is re-established
        createOrReplaceDocument({
          documentId: docId,
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
        if (OS === "web") {
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
    try {
      // this is necessary to propagate document name update to the sidebar and header
      createOrReplaceDocument({
        documentId: docId,
        name: title,
      });
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

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditDocumentsAndFolders = useCanEditDocumentsAndFolders({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });
  const canComment = useCanComment({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });

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
        editable={!state.matches("failed") && canEditDocumentsAndFolders}
        canComment={canComment}
        documentId={docId}
        workspaceId={workspaceId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        openDrawer={navigation.openDrawer}
        updateTitle={updateTitle}
        isNew={isNew}
        documentLoaded={documentLoaded || state.matches("failed")}
        documentState={documentState}
        currentDeviceSigningPublicKey={sodium.to_base64(
          signatureKeyPair.publicKey
        )}
      />
    </>
  );
}
